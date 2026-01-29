<template>
    <div
        v-if="selectedProduct"
        class="fixed inset-0 z-10 bg-black/40 font-mono text-slate-900"
        @click.self="searchStore.clearSelectedProduct()"
    >
        <div class="absolute right-0 top-0 flex h-full w-full max-w-4xl flex-col gap-5 border-l border-slate-200 bg-white p-6 shadow-xl">
            <div
                v-if="showProductPage"
                class="absolute bottom-4 left-4 right-4 top-4 z-10 flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-2xl"
                @click.stop
                @mousedown.stop
            >
                <header class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p class="text-xs uppercase tracking-[0.25em] text-slate-500">
                            Product page response
                        </p>
                        <h2 class="text-2xl font-semibold text-slate-900">{{ selectedProduct?.title || 'Selected product' }}</h2>
                        <p class="text-sm text-slate-600">
                            {{ selectedProduct?.brand }} · {{ selectedProduct?.series || '—' }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="rounded border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
                        @click.stop="closeProductPage"
                        @mousedown.stop
                    >
                        Close
                    </button>
                </header>
                <section class="flex-1 overflow-auto">
                    <div v-if="selectedProductPage">
                        <pre class="rounded border border-slate-200 bg-slate-50 p-4 text-xs! text-slate-700"><code ref="codeBlock2" class="language-json">{{ JSON.stringify(selectedProductPage, null, 2) }}</code></pre>
                    </div>
                    <p v-else class="text-sm text-slate-600">
                        Product page response is still loading.
                    </p>
                </section>
            </div>
            <header class="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Product inspector
                    </p>
                    <h2 class="text-2xl font-semibold text-slate-900">{{ selectedProduct.title }}</h2>
                    <p class="text-sm text-slate-600">
                        {{ selectedProduct.brand }} · {{ selectedProduct.series || '—' }}
                    </p>
                    <p class="text-sm text-slate-600">{{ formatPrice(selectedProduct) }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        class="rounded border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
                        @click="showProductPage ? closeProductPage() : (showProductPage = true)"
                    >
                        {{ showProductPage ? 'Hide product page' : 'Show product page' }}
                    </button>
                    <button
                        type="button"
                        class="rounded border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
                        @click="searchStore.clearSelectedProduct()"
                    >
                        Close
                    </button>
                </div>
            </header>

            <div class="flex flex-col gap-6 overflow-auto">
                <section>
                    <h3 class="text-base font-semibold text-slate-900" @click="toggleSection('listDetails')">List details</h3>
                    <p class="mt-2 text-sm text-slate-600">{{ selectedProduct.description }}</p>
                    <dl class="mt-4 grid gap-3 text-sm">
                        <div>
                            <dt class="text-xs uppercase tracking-[0.25em] text-slate-500">
                                SKU
                            </dt>
                            <dd class="font-semibold text-slate-900">{{ selectedProduct.key }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Tags
                            </dt>
                            <dd class="font-semibold text-slate-900">{{ tagText || '—' }}</dd>
                        </div>
                    </dl>


                </section>
                <section class="flex-1 overflow-auto">
                    <pre class="rounded border border-slate-200 bg-slate-50 p-4 text-xs! text-slate-700"><code ref="codeBlock" class="language-json">{{ JSON.stringify(selectedProduct, null, 2) }}</code></pre>
                </section>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Product } from '@apptus/esales-api'
import { useSearchStore } from '../stores/searchStore'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

const searchStore = useSearchStore()
const { selectedProduct, selectedProductPage } = storeToRefs(searchStore)
const codeBlock = ref<HTMLElement | null>(null)
const codeBlock2 = ref<HTMLElement | null>(null)
const toggledSections = ref<string[]>([])
const showProductPage = ref(false)
const isClosingProductPage = ref(false)

const formatPrice = (product: Product) => {
    const { min, max } = product.sellingPrice

    return min === max ? `${min}` : `${min} - ${max}`
}

const getTags = (product: Product) => {
    const tags = product.custom?.tags

    return Array.isArray(tags) ? (tags as string[]) : []
}

const tagText = computed(() => {
    if (!selectedProduct.value) return ''

    return getTags(selectedProduct.value).join(', ')
})

const highlightCode = async () => {
    await nextTick()

    if (codeBlock.value) {
        Prism.highlightElement(codeBlock.value)
    }

    if (codeBlock2.value) {
        Prism.highlightElement(codeBlock2.value)
    }
}

const toggleSection = (section: string) => {
    const index = toggledSections.value.indexOf(section)

    if (index === -1) {
        toggledSections.value.push(section)
    } else {
        toggledSections.value.splice(index, 1)
    }
}

const closeProductPage = () => {
    if (isClosingProductPage.value) return
    isClosingProductPage.value = true
    window.setTimeout(() => {
        showProductPage.value = false
        isClosingProductPage.value = false
    }, 150)
}

onMounted(() => {
    highlightCode()
})

watch(selectedProduct, () => {
    showProductPage.value = false
    isClosingProductPage.value = false
    highlightCode()
})

watch([selectedProductPage, showProductPage], () => {
    highlightCode()
})

</script>
