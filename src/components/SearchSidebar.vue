<template>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="w-full max-w-xl space-y-3 lg:w-[360px]">
            <div class="flex items-center justify-between gap-3">
                <h2 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Search</h2>
                <button
                    type="button"
                    class="rounded border border-slate-300 bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
                    @click="openCatModal"
                >
                    Cat Gif
                </button>
            </div>
            <div class="inline-flex w-full rounded border border-slate-300 bg-slate-50 p-1 text-xs">
                <button
                    type="button"
                    class="flex-1 rounded px-3 py-2 uppercase tracking-[0.2em] transition"
                    :class="mode === 'search' ? 'bg-white text-slate-900' : 'text-slate-500'"
                    @click="mode = 'search'"
                >
                    Search
                </button>
                <button
                    type="button"
                    class="flex-1 rounded px-3 py-2 uppercase tracking-[0.2em] transition"
                    :class="mode === 'landing' ? 'bg-white text-slate-900' : 'text-slate-500'"
                    @click="mode = 'landing'"
                >
                    Landing
                </button>
            </div>

            <input
                v-if="mode === 'landing'"
                v-model.trim="landingPageUrl"
                placeholder="Landing page path (e.g. /women/shoes)"
                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
            />
            <input
                v-model.trim="searchTerm"
                :placeholder="mode === 'landing'
                    ? 'Optional search refinement'
                    : 'Search query'"
                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
            />
            <div class="space-y-2">
                <label class="text-xs uppercase tracking-[0.2em] text-slate-500">Results per page</label>
                <select
                    v-model.number="resultsPerPage"
                    class="w-full min-w-[220px] rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                    <option :value="12">12</option>
                    <option :value="48">48</option>
                    <option :value="128">128</option>
                    <option :value="512">512</option>
                </select>
            </div>

            <div v-if="sortOptions.length" class="space-y-2">
                <label class="text-xs uppercase tracking-[0.2em] text-slate-500">Sort</label>
                <select
                    :value="selectedSort"
                    class="w-full min-w-[220px] rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    @change="onSortChange"
                >
                    <option v-for="option in sortOptions" :key="option.id" :value="option.id">
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <div v-if="facets.length" class="space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs uppercase tracking-[0.2em] text-slate-500">Facets</h3>
                    <button
                        v-if="hasSelectedFacets"
                        type="button"
                        class="text-[11px] uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-700"
                        @click="clearAllFacets"
                    >
                        Clear
                    </button>
                </div>

                <div v-for="facet in facets" :key="facet.id" class="space-y-2 rounded border border-slate-200 bg-white p-3">
                    <div class="flex items-center justify-between">
                        <h4 class="text-[11px] uppercase tracking-[0.2em] text-slate-500">{{ facet.label }}</h4>
                        <button
                            v-if="facetHasSelection(facet.id, getFacetFallbackCount(facet))"
                            type="button"
                            class="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-600"
                            @click="clearFacet(facet.id)"
                        >
                            Clear
                        </button>
                    </div>

                    <div v-if="facet.type === 'RANGE'" class="space-y-2">
                        <div class="grid grid-cols-2 gap-2">
                            <input
                                v-model="rangeInputs[facet.id].min"
                                type="number"
                                inputmode="decimal"
                                placeholder="Min"
                                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                            />
                            <input
                                v-model="rangeInputs[facet.id].max"
                                type="number"
                                inputmode="decimal"
                                placeholder="Max"
                                class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                            />
                        </div>
                        <p v-if="facet.min !== undefined || facet.max !== undefined" class="text-[11px] text-slate-500">
                            Available {{ facet.min ?? '—' }} - {{ facet.max ?? '—' }} {{ facet.unit ?? '' }}
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <button
                                type="button"
                                class="rounded border border-slate-300 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
                                @click="applyRange(facet.id)"
                            >
                                Apply
                            </button>
                            <button
                                v-if="facetHasSelection(facet.id)"
                                type="button"
                                class="rounded border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300"
                                @click="clearRange(facet.id)"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div v-else-if="facet.type === 'CHECKBOX'" class="flex items-center justify-between gap-2 text-sm text-slate-700">
                        <label class="flex items-center gap-2">
                            <input
                                type="checkbox"
                                class="rounded border-slate-300 text-slate-900"
                                :checked="isFacetChecked(facet.id, facet.selected)"
                                @change="toggleFacetCheckbox(facet.id, ($event.target as HTMLInputElement).checked)"
                            />
                            <span>Enabled</span>
                        </label>
                        <span v-if="facet.count" class="text-[11px] text-slate-400">{{ facet.count }}</span>
                    </div>

                    <div v-else-if="facet.type === 'SIZE'" class="space-y-3">
                        <div v-for="sizeType in facet.sizeTypes" :key="sizeType.label" class="space-y-2">
                            <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">{{ sizeType.label }}</p>
                            <div v-for="format in sizeType.formats" :key="format.format" class="space-y-2">
                                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-400">{{ format.format }}</p>
                                <div class="flex flex-wrap gap-2">
                                    <label
                                        v-for="value in format.values"
                                        :key="value.id"
                                        class="flex items-center gap-2 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-700"
                                    >
                                        <input
                                            type="checkbox"
                                            class="rounded border-slate-300 text-slate-900"
                                            :checked="isFacetValueSelected(facet.id, value.id, value.selected)"
                                            @change="toggleFacetValue(facet.id, value.id)"
                                        />
                                        <span>{{ value.label }}</span>
                                        <span class="text-[10px] text-slate-400">{{ value.count }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="max-h-48 space-y-2 overflow-auto pr-1">
                        <label
                            v-for="value in facet.values"
                            :key="value.id"
                            class="flex items-center gap-2 text-sm text-slate-700"
                        >
                            <input
                                type="checkbox"
                                class="rounded border-slate-300 text-slate-900"
                                :checked="isFacetValueSelected(facet.id, value.id, value.selected)"
                                @change="toggleFacetValue(facet.id, value.id)"
                            />
                            <span class="flex items-center gap-2">
                                <span
                                    v-if="facet.type === 'COLOR'"
                                    class="inline-flex size-3 rounded-full border border-slate-200"
                                    :style="{ backgroundColor: value.color }"
                                ></span>
                                <span>{{ value.label }}</span>
                            </span>
                            <span class="ml-auto text-[11px] text-slate-400">{{ value.count }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <p v-if="isLoading" class="text-xs text-slate-500">Searching…</p>
            <p v-else-if="errorMessage" class="text-xs text-rose-400">
                {{ errorMessage }}
            </p>

        </div>
    </div>

    <div
        v-if="showCatModal"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4"
        role="dialog"
        aria-modal="true"
    >
        <div class="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 class="text-sm font-semibold text-slate-700">Random Cat Gif</h3>
                <button
                    type="button"
                    class="rounded border border-slate-300 bg-white px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
                    @click="showCatModal = false"
                >
                    Close
                </button>
            </div>
            <div class="flex items-center justify-center bg-slate-50 p-4">
                <img
                    :src="catGifUrl"
                    alt="Random cat gif"
                    class="max-h-[320px] w-full rounded object-cover"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Facet, RangeFacet } from '@apptus/esales-api'
import { useSearchStore } from '../stores/searchStore'
const showCatModal = ref(false)
const catGifUrl = ref('')

const searchStore = useSearchStore()
const {
    facets,
    mode,
    landingPageUrl,
    searchTerm,
    resultsPerPage,
    isLoading,
    error,
    selectedFacets,
    selectedSort,
    sortOptions,
} = storeToRefs(searchStore)
const {
    clearAllFacets,
    clearFacet,
    setFacetRange,
    setSort,
    toggleFacetCheckbox,
    toggleFacetValue,
} = searchStore


const errorMessage = computed(() => {
    if (!error.value) return ''

    return error.value instanceof Error ? error.value.message : String(error.value)
})

const hasSelectedFacets = computed(() => {
    return Object.values(selectedFacets.value).some((value) => {
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'boolean') return value
        if (value && typeof value === 'object') {
            const range = value as { min?: number; max?: number }

            return typeof range.min === 'number' || typeof range.max === 'number'
        }
        return false
    })
})

const isRangeValue = (value: unknown): value is { min?: number; max?: number } => {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const facetHasSelection = (facetId: string, fallbackCount = 0) => {
    const value = selectedFacets.value[facetId]

    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'boolean') return value
    if (isRangeValue(value)) return typeof value.min === 'number' || typeof value.max === 'number'

    return fallbackCount > 0
}

const getFacetFallbackCount = (facet: Facet) => {
    if ('selectedCount' in facet) return facet.selectedCount
    if (facet.type === 'CHECKBOX') return facet.selected ? 1 : 0

    return 0
}

const isFacetValueSelected = (facetId: string, valueId: string, fallback: boolean) => {
    const value = selectedFacets.value[facetId]
    if (Array.isArray(value)) return value.includes(valueId)

    return fallback
}

const isFacetChecked = (facetId: string, fallback: boolean) => {
    const value = selectedFacets.value[facetId]
    if (typeof value === 'boolean') return value

    return fallback
}

const rangeInputs = ref<Record<string, { min: string; max: string }>>({})

watch([facets, selectedFacets], ([nextFacets]) => {
    const updated = { ...rangeInputs.value }

    nextFacets.forEach((facet) => {
        if (facet.type !== 'RANGE') return

        const value = selectedFacets.value[facet.id]
        if (isRangeValue(value)) {
            updated[facet.id] = {
                min: typeof value.min === 'number' ? String(value.min) : '',
                max: typeof value.max === 'number' ? String(value.max) : '',
            }
        } else {
            updated[facet.id] = {
                min: '',
                max: '',
            }
        }
    })

    rangeInputs.value = updated
}, { immediate: true, flush: 'sync' })

const applyRange = (facetId: string) => {
    const entry = rangeInputs.value[facetId]
    let min = entry?.min ? Number(entry.min) : undefined
    let max = entry?.max ? Number(entry.max) : undefined
    const facet = facets.value.find((item): item is RangeFacet => item.id === facetId && item.type === 'RANGE')

    if (typeof min === 'number' && Number.isFinite(min) && typeof facet?.min === 'number') {
        min = Math.max(min, facet.min)
    }

    if (typeof max === 'number' && Number.isFinite(max) && typeof facet?.max === 'number') {
        max = Math.min(max, facet.max)
    }

    if (typeof min === 'number' && typeof max === 'number' && min > max) {
        const swap = min
        min = max
        max = swap
    }

    const range: { min?: number; max?: number } = {}

    if (typeof min === 'number' && Number.isFinite(min)) {
        range.min = min
    }

    if (typeof max === 'number' && Number.isFinite(max)) {
        range.max = max
    }

    if (typeof range.min !== 'number' && typeof range.max !== 'number') {
        clearFacet(facetId)
        return
    }

    setFacetRange(facetId, range)
}

const clearRange = (facetId: string) => {
    clearFacet(facetId)
    rangeInputs.value = {
        ...rangeInputs.value,
        [facetId]: { min: '', max: '' },
    }
}

const onSortChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    setSort(value as typeof selectedSort.value)
}

const openCatModal = () => {
    catGifUrl.value = `https://cataas.com/cat/gif?${Date.now()}`
    showCatModal.value = true
}
</script>
