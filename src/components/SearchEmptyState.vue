<template>
    <div
        v-if="showEmptyState"
        class="space-y-3 flex items-center justify-center rounded border border-slate-200 bg-white p-6 w-full"
    >
        <p
            v-if="mode === 'landing' && !landingPageUrl && filteredProducts.length === 0"
            class="text-sm text-slate-600"
        >
            Enter a landing page path to query Elevate.
        </p>
        <p v-else-if="mode === 'search' && !searchTerm && filteredProducts.length === 0" class="text-sm text-slate-600">
            Enter a search query to query Elevate.
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '../stores/searchStore'

const searchStore = useSearchStore()
const { filteredProducts, recommendationLists, landingPageUrl, searchTerm, mode } = storeToRefs(searchStore)

const showEmptyState = computed(() => {
    return !filteredProducts.value.length && recommendationLists.value.length === 0
})
</script>
