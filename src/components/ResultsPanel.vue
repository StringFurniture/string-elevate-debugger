<template>
    <div class="flex w-full">
        <ProductGrid />
        <RecommendationLists />
        <SearchEmptyState />
    </div>
</template>

<script setup lang="ts">
import ProductGrid from './ProductGrid.vue'
import RecommendationLists from './RecommendationLists.vue'
import SearchEmptyState from './SearchEmptyState.vue'
</script>
