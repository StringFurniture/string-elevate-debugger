<template>
    <section v-if="showLists" class="space-y-6 w-full">
        <div
            v-for="list in recommendationLists"
            :key="list.id"
            class="space-y-3 rounded border border-slate-200 bg-white p-6 w-full"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-slate-500">
                        recommendations
                    </p>
                    <h3 class="text-base font-semibold text-slate-900">
                        {{ list.id }}
                    </h3>
                </div>
                <div class="flex flex-col text-xs text-slate-500">
                    <div>
                        <span>Visualization: </span><span class="font-bold">{{ list.visualization }}</span>
                    </div>
                    <div>
                        <span>Algorithm: </span>
                        <span class="font-bold">{{ list.algorithm }}</span>
                    </div>
                </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <ProductCard
                    v-for="product in list.products"
                    :key="product.key"
                    :product="product"
                    variant="recommendation"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSearchStore } from '../stores/searchStore'
import ProductCard from './ProductCard.vue'

const searchStore = useSearchStore()
const { recommendationLists, filteredProducts } = storeToRefs(searchStore)

const showLists = computed(() => {
    return !filteredProducts.value.length && recommendationLists.value.length > 0
})
</script>
