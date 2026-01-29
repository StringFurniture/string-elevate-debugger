<template>
    <button
        type="button"
        class="overflow-hidden rounded border border-slate-200 bg-white text-left transition hover:border-slate-400"
        @click="searchStore.selectProduct(product)"
    >
        <div class="flex">
            <img
                :src="product.imageInfo.images[0]?.sources[0]?.url"
                alt="Product image"
                class="size-28 shrink-0 object-contain p-4 bg-slate-50 border-r border-slate-200"
            />

            <div class="flex justify-between flex-col p-4">
                <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {{ product.key }}
                </p>
                <h3 class="text-sm font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">{{ product.title }}</h3>
                <p class="text-xs text-slate-600">{{ product.series || '—' }}</p>
                <p class="text-xs text-slate-600 font-bold">{{ formatPrice(product) }}</p>
            </div>
        </div>
    </button>
</template>

<script setup lang="ts">
import type { Product } from '@apptus/esales-api'
import { useSearchStore } from '../stores/searchStore'
import { formatPrice } from '../utils/formatPrice'

withDefaults(defineProps<{
    product: Product
    variant?: 'search' | 'recommendation'
}>(), {
    variant: 'search',
})

const searchStore = useSearchStore()
</script>
