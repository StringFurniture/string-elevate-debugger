import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Facet, FacetParams, Product, ProductGroup, Sort, SortOption, SortType } from '@apptus/esales-api'
import { useElevateStore } from './elevateStore'

type SearchResult = {
    primaryList?: {
        productGroups?: ProductGroup[]
        facets?: Facet[]
        sort?: Sort
        totalHits?: number
    }
    autoCorrect?: {
        q: string
        originalTotalHits: number
    }
    recommendationLists?: RecommendationList[]
} & Record<string, unknown>

type RecommendationList = {
    id?: string
    visualization?: string
    visible?: boolean
    productGroups?: ProductGroup[],
    algorithm?: string
} & Record<string, unknown>

const mapProductsFromGroups = (groups?: ProductGroup[]): Product[] => {
    if (!groups?.length) return []

    return groups
        .map((group) => group.products?.[0])
        .filter((product): product is Product => Boolean(product))
}

const mapProducts = (result: SearchResult): Product[] => {
    return mapProductsFromGroups(result.primaryList?.productGroups)
}

const mapRecommendations = (result: SearchResult) => {
    return (result.recommendationLists ?? []).map((list) => {
        return {
            id: list.id || 'recommendations',
            visualization: list.visualization,
            visible: list.visible !== false,
            algorithm: list.algorithm,
            products: mapProductsFromGroups(list.productGroups),
        }
    })
}

export const useSearchStore = defineStore('search', () => {
    const elevateStore = useElevateStore()
    const persistedMode = localStorage.getItem('elevate-debugger-mode')
    const persistedSearchTerm = localStorage.getItem('elevate-debugger-search-term')
    const persistedLandingPageUrl = localStorage.getItem('elevate-debugger-landing-url')
    const mode = ref<'search' | 'landing'>(persistedMode === 'landing' ? 'landing' : 'search')
    const searchTerm = ref(persistedSearchTerm ?? '')
    const landingPageUrl = ref(persistedLandingPageUrl ?? '')
    const products = ref<Product[]>([])
    const selectedProduct = ref<Product | null>(null)
    const selectedProductPage = ref<any>(null)
    const resultsPerPage = ref(12)
    const currentPage = ref(1)
    const facets = ref<Facet[]>([])
    const sortOptions = ref<SortOption[]>([])
    const selectedSort = ref<SortType>('RELEVANCE')
    const selectedFacets = ref<FacetParams>({})
    const totalHits = ref(0)
    const autoCorrect = ref<SearchResult['autoCorrect'] | null>(null)
    const isLoading = ref(false)
    const error = ref<unknown>(null)
    const rawResponse = ref<SearchResult | null>(null)
    const recommendationLists = ref<ReturnType<typeof mapRecommendations>>([])
    const filteredProducts = computed(() => products.value)
    const pageOffset = computed(() => (currentPage.value - 1) * resultsPerPage.value)
    const totalPages = computed(() => {
        const normalizedLimit = resultsPerPage.value || 1

        return Math.max(1, Math.ceil(totalHits.value / normalizedLimit))
    })
    const canGoPrev = computed(() => currentPage.value > 1)
    const canGoNext = computed(() => currentPage.value < totalPages.value)

    let requestId = 0
    let debounceId: number | undefined
    let suppressSearch = false
    let productRequestId = 0

    const isValidLandingPage = (value: string) => {
        const normalized = value.trim()

        return normalized.startsWith('/') && normalized.length > 1
    }

    const deriveSelectedFacets = (facetList: Facet[]): FacetParams => {
        const next: FacetParams = {}

        facetList.forEach((facet) => {
            if (facet.type === 'RANGE') {
                const minSelected = facet.minSelected
                const maxSelected = facet.maxSelected

                if (typeof minSelected === 'number' || typeof maxSelected === 'number') {
                    next[facet.id] = {
                        min: minSelected,
                        max: maxSelected,
                    }
                }

                return
            }

            if (facet.type === 'CHECKBOX') {
                if (facet.selected) {
                    next[facet.id] = true
                }

                return
            }

            if (facet.type === 'SIZE') {
                const selectedValues: string[] = []

                facet.sizeTypes.forEach((sizeType) => {
                    sizeType.formats.forEach((format) => {
                        format.values.forEach((value) => {
                            if (value.selected) {
                                selectedValues.push(value.id)
                            }
                        })
                    })
                })

                if (selectedValues.length) {
                    next[facet.id] = selectedValues
                }

                return
            }

            const selectedValues = facet.values
                .filter((value) => value.selected)
                .map((value) => value.id)

            if (selectedValues.length) {
                next[facet.id] = selectedValues
            }
        })

        return next
    }

    const runSearch = async () => {
        const term = searchTerm.value.trim()
        const landingPage = landingPageUrl.value.trim()
        const useLandingPage = mode.value === 'landing'

        if (!term && !useLandingPage) {
            products.value = []
            recommendationLists.value = []
            facets.value = []
            sortOptions.value = []
            totalHits.value = 0
            selectedFacets.value = {}
            autoCorrect.value = null
            rawResponse.value = null

            return
        }

        if (useLandingPage && !isValidLandingPage(landingPage)) {
            products.value = []
            recommendationLists.value = []
            facets.value = []
            sortOptions.value = []
            totalHits.value = 0
            selectedFacets.value = {}
            autoCorrect.value = null
            rawResponse.value = null

            return
        }

        const api = elevateStore.api

        if (useLandingPage && !api?.query?.landingPage) {
            error.value = new Error('Elevate landingPage query is not available.')

            return
        }

        if (!useLandingPage && !api?.query?.searchPage) {
            error.value = new Error('Elevate searchPage query is not available.')

            return
        }

        const currentRequest = ++requestId
        isLoading.value = true
        error.value = null

        try {
            const result = (useLandingPage
                ? await api.query.landingPage({
                    pageReference: landingPage,
                    q: term || undefined,
                    limit: resultsPerPage.value,
                    skip: pageOffset.value,
                    sort: selectedSort.value,
                    facets: selectedFacets.value,
                })
                : await api.query.searchPage({
                    q: term,
                    limit: resultsPerPage.value,
                    skip: pageOffset.value,
                    origin: 'ORGANIC',
                    sort: selectedSort.value,
                    facets: selectedFacets.value,
                })) as SearchResult

            if (currentRequest !== requestId) return

            rawResponse.value = result
            products.value = mapProducts(result)
            recommendationLists.value = mapRecommendations(result)
            suppressSearch = true
            facets.value = result.primaryList?.facets ?? []
            sortOptions.value = result.primaryList?.sort?.options ?? []
            totalHits.value = result.primaryList?.totalHits ?? 0
            autoCorrect.value = (result as SearchResult & { autocorrect?: SearchResult['autoCorrect'] }).autoCorrect
                ?? (result as SearchResult & { autocorrect?: SearchResult['autoCorrect'] }).autocorrect
                ?? null
            if (result.primaryList?.sort?.selected && selectedSort.value !== result.primaryList.sort.selected) {
                selectedSort.value = result.primaryList.sort.selected
            }
            selectedFacets.value = deriveSelectedFacets(facets.value)
            window.setTimeout(() => {
                suppressSearch = false
            }, 0)
        } catch (err) {
            if (currentRequest !== requestId) return
            error.value = err
        } finally {
            if (currentRequest === requestId) {
                isLoading.value = false
            }
        }
    }

    const fetchProductPage = async (product: Product) => {
        const api = elevateStore.api

        if (!api?.query?.productPage) {
            throw new Error('Elevate productPage query is not available.')
        }

        const currentProductRequest = ++productRequestId
        const result = await api.query.productPage({
            productKey: product.key,
        }, {
            productGroup: {
                include: false,
            },
            recommendationLists: [
                { id: 'PDP-1', algorithm: 'STYLE_WITH', limit: 6 },
                { id: 'TOP-1', algorithm: 'TOP_PRODUCTS', limit: 6 },
            ],
        })

        if (currentProductRequest !== productRequestId) return
        if (selectedProduct.value?.key !== product.key) return

        selectedProductPage.value = result

        console.log('Fetched product page:', result)
    }

    const queueSearch = () => {
        if (suppressSearch) return
        if (debounceId) window.clearTimeout(debounceId)
        debounceId = window.setTimeout(() => {
            runSearch()
        }, 250)
    }

    const nextPage = () => {
        if (!canGoNext.value) return
        currentPage.value += 1
    }

    const prevPage = () => {
        if (!canGoPrev.value) return
        currentPage.value -= 1
    }

    const setPage = (page: number) => {
        const normalized = Math.max(1, Math.min(Math.floor(page), totalPages.value))

        if (normalized === currentPage.value) return
        currentPage.value = normalized
    }

    const setSort = (sort: SortType) => {
        if (selectedSort.value === sort) return
        selectedSort.value = sort
        currentPage.value = 1
    }

    const toggleFacetValue = (facetId: string, valueId: string) => {
        const current = selectedFacets.value[facetId]
        const list = Array.isArray(current) ? [...current] : []
        const index = list.indexOf(valueId)

        if (index === -1) {
            list.push(valueId)
        } else {
            list.splice(index, 1)
        }

        const next = { ...selectedFacets.value }

        if (list.length) {
            next[facetId] = list
        } else {
            delete next[facetId]
        }

        selectedFacets.value = next
        currentPage.value = 1
    }

    const toggleFacetCheckbox = (facetId: string, enabled: boolean) => {
        const next = { ...selectedFacets.value }

        if (enabled) {
            next[facetId] = true
        } else {
            delete next[facetId]
        }

        selectedFacets.value = next
        currentPage.value = 1
    }

    const setFacetRange = (facetId: string, range: FacetParams[string]) => {
        const next = { ...selectedFacets.value }

        if (range && typeof range === 'object' && !Array.isArray(range)) {
            const hasMin = typeof (range as { min?: number }).min === 'number'
            const hasMax = typeof (range as { max?: number }).max === 'number'

            if (hasMin || hasMax) {
                next[facetId] = range
            } else {
                delete next[facetId]
            }
        } else {
            delete next[facetId]
        }

        selectedFacets.value = next
        currentPage.value = 1
    }

    const clearFacet = (facetId: string) => {
        const next = { ...selectedFacets.value }
        delete next[facetId]
        selectedFacets.value = next
        currentPage.value = 1
    }

    const clearAllFacets = () => {
        if (!Object.keys(selectedFacets.value).length) return
        selectedFacets.value = {}
        currentPage.value = 1
    }

    watch(
        () => [
            mode.value,
            searchTerm.value,
            landingPageUrl.value,
            resultsPerPage.value,
            currentPage.value,
            selectedSort.value,
            selectedFacets.value,
            elevateStore.api,
            elevateStore.config.market,
            elevateStore.config.locale,
            elevateStore.config.customerKey,
            elevateStore.config.sessionKey,
            elevateStore.config.touchpoint,
            elevateStore.config.clusterId,
        ],
        () => {
            queueSearch()
        },
    )

    watch([mode, searchTerm, landingPageUrl], () => {
        currentPage.value = 1
        selectedFacets.value = {}
        facets.value = []
        sortOptions.value = []
        totalHits.value = 0
        autoCorrect.value = null
    })

    watch(resultsPerPage, () => {
        currentPage.value = 1
    })

    watch([resultsPerPage, totalHits], () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value
        }
    })

    watch(mode, (value) => {
        localStorage.setItem('elevate-debugger-mode', value)
    })

    watch(searchTerm, (value) => {
        localStorage.setItem('elevate-debugger-search-term', value)
    })

    watch(landingPageUrl, (value) => {
        localStorage.setItem('elevate-debugger-landing-url', value)
    })

    if (searchTerm.value.trim() || landingPageUrl.value.trim()) {
        queueSearch()
    }

    const selectProduct = (product: Product) => {
        selectedProduct.value = product
        selectedProductPage.value = null
        console.log('Selected product:', product)

        fetchProductPage(product).catch((err) => {
            console.error('Failed to fetch product page:', err)
        })
    }

    const clearSelectedProduct = () => {
        selectedProduct.value = null
        selectedProductPage.value = null
    }

    return {
        clearAllFacets,
        clearFacet,
        clearSelectedProduct,
        facets,
        currentPage,
        error,
        canGoNext,
        canGoPrev,
        filteredProducts,
        isLoading,
        landingPageUrl,
        mode,
        nextPage,
        prevPage,
        products,
        recommendationLists,
        rawResponse,
        resultsPerPage,
        selectedFacets,
        selectedSort,
        searchTerm,
        setFacetRange,
        setPage,
        setSort,
        selectProduct,
        selectedProduct,
        selectedProductPage,
        sortOptions,
        totalHits,
        totalPages,
        autoCorrect,
        toggleFacetCheckbox,
        toggleFacetValue,
    }
})
