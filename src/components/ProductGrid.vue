<template>
    <div v-if="filteredProducts.length" class="w-full">
        <div
            v-if="showAutoCorrect"
            class="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs uppercase tracking-[0.2em] text-amber-700"
        >
            <span class="font-bold">Auto-corrected:</span>
            no results for {{ autoCorrectMessage.original }}, showing results for {{ autoCorrectMessage.corrected }}
        </div>
        <div class="grid gap-4 rounded border border-slate-200 bg-white p-6 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard
                v-for="product in filteredProducts"
                :key="product.key"
                :product="product"
            />
        </div>
        <div class="mt-4 flex justify-center items-center mx-auto gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <button
                type="button"
                class="rounded border border-slate-300 bg-white px-3 py-2 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!canGoPrev"
                @click="setPage(1)"
                aria-label="First page"
            >
                <<
            </button>
            <button
                type="button"
                class="rounded border border-slate-300 bg-white px-3 py-2 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!canGoPrev"
                @click="prevPage"
                aria-label="Previous page"
            >
                <
            </button>
            <div class="flex flex-wrap items-center gap-2">
                <span v-if="showLeftEllipsis"
                    class="px-2 text-slate-400"
                    aria-hidden="true">…</span>
                <button
                    v-for="page in pageButtons"
                    :key="page"
                    type="button"
                    class="rounded border border-slate-300 bg-white px-3 py-2 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                    :class="page === currentPage ? 'border-slate-900 text-slate-900' : 'text-slate-500'"
                    :disabled="page === currentPage"
                    @click="setPage(page)"
                >
                    {{ page }}
                </button>
                <span v-if="showRightEllipsis"
                    class="px-2 text-slate-400"
                    aria-hidden="true">…</span>
            </div>
            <button
                type="button"
                class="rounded border border-slate-300 bg-white px-3 py-2 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!canGoNext"
                @click="nextPage"
                aria-label="Next page"
            >
                >
            </button>
            <button
                type="button"
                class="rounded border border-slate-300 bg-white px-3 py-2 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!canGoNext"
                @click="setPage(lastPage)"
                aria-label="Last page"
            >
                >>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '../stores/searchStore'
import ProductCard from './ProductCard.vue'

const searchStore = useSearchStore()
const { filteredProducts, currentPage, canGoNext, canGoPrev, totalPages, autoCorrect, searchTerm } = storeToRefs(searchStore)
const { nextPage, prevPage, setPage } = searchStore

const lastPage = computed(() => totalPages.value)

const pageButtons = computed(() => {
    const windowSize = 2
    const start = Math.max(1, currentPage.value - windowSize)
    const end = Math.min(totalPages.value, currentPage.value + windowSize)

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const autoCorrectMessage = computed(() => {
    const corrected = autoCorrect.value?.q?.trim() ?? ''
    const original = searchTerm.value.trim()

    return {
        corrected,
        original,
    }
})

const showAutoCorrect = computed(() => {
    if (!autoCorrect.value) return false
    if (autoCorrect.value.originalTotalHits !== 0) return false

    const { corrected, original } = autoCorrectMessage.value

    return Boolean(original && corrected && corrected !== original)
})

const showLeftEllipsis = computed(() => {
    const first = pageButtons.value[0]

    return Boolean(first && first > 1)
})

const showRightEllipsis = computed(() => {
    const last = pageButtons.value[pageButtons.value.length - 1]

    return Boolean(last && last < totalPages.value)
})
</script>
