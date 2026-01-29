<template>
    <main
        class="min-h-screen bg-[#f4f3ee] px-5 py-12 font-mono text-slate-900"
    >
        <div class="mx-auto flex w-full container flex-col gap-8">
            <header class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div class="grow">
                    <p class="text-xs uppercase tracking-[0.25em] text-slate-500">
                        elevate debugger
                    </p>
                    <h1 class="mt-3 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
                        Product explorer for Elevate behavior
                    </h1>
                    <p class="mt-3 max-w-2xl text-sm text-slate-600">
                        The client is auto-connected. Change locale and market, search products, and inspect the
                        full payload in a modal.
                    </p>
                </div>
                <div class="flex items-start gap-3">
                    <select
                        v-model="selectedMarket"
                        class="min-w-[220px] rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    >
                        <option v-for="entry in elevateMarkets"
                            :key="entry.market"
                            :value="entry.market">
                            {{ entry.market }} -> {{ entry.locale }}
                        </option>
                    </select>
                    <button
                        type="button"
                        class="inline-flex items-center justify-center rounded border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                        aria-label="Settings"
                        @click="showSettings = true"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.214 1.281c.08.48.43.873.89 1.01l1.2.36c.52.156 1.08-.04 1.39-.472l.76-1.04a1.1 1.1 0 0 1 1.51-.24l1.83 1.34c.46.33.59.95.3 1.43l-.69 1.16c-.25.43-.24.96.03 1.38l.65 1.01c.29.45.29 1.02 0 1.47l-.65 1.01c-.27.42-.28.95-.03 1.38l.69 1.16c.29.48.16 1.1-.3 1.43l-1.83 1.34c-.45.33-1.09.24-1.51-.24l-.76-1.04c-.31-.43-.87-.63-1.39-.47l-1.2.36c-.46.14-.81.53-.89 1.01l-.214 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.214-1.281c-.08-.48-.43-.873-.89-1.01l-1.2-.36c-.52-.156-1.08.04-1.39.472l-.76 1.04a1.1 1.1 0 0 1-1.51.24l-1.83-1.34a1.1 1.1 0 0 1-.3-1.43l.69-1.16c.25-.43.24-.96-.03-1.38l-.65-1.01a1.1 1.1 0 0 1 0-1.47l.65-1.01c.27-.42.28-.95.03-1.38l-.69-1.16a1.1 1.1 0 0 1 .3-1.43l1.83-1.34c.45-.33 1.09-.24 1.51.24l.76 1.04c.31.43.87.63 1.39.47l1.2-.36c.46-.14.81-.53.89-1.01l.214-1.281Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
                        </svg>
                    </button>
                </div>

            </header>
            <div class="flex">

            </div>
            <ProductView />
        </div>

        <ProductModal />
        <SettingsModal :showSettings="showSettings" @update:showSettings="showSettings = $event" />


    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProductModal from './components/ProductModal.vue'
import ProductView from './components/ProductView.vue'
import SettingsModal from './components/SettingsModal.vue'
import { useElevateStore } from './stores/elevateStore'
import { storeToRefs } from 'pinia'

const showSettings = ref(false)
const elevateStore = useElevateStore()
const { selectedMarket } = storeToRefs(elevateStore)
const { elevateMarkets } = elevateStore
</script>
