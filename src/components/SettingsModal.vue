
<template>
    <div
        v-if="showSettings"
        class="fixed inset-0 z-10 grid place-items-center bg-black/40 p-6 font-mono text-slate-900"
        @click.self="$emit('update:showSettings', false)"
    >
        <div
            class="grid w-full max-w-2xl gap-5 rounded border border-slate-200 bg-white p-6"
        >
            <header class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Client settings
                    </p>
                    <h3 class="text-xl font-semibold text-slate-900">Elevate configuration</h3>
                    <div
                        class="mt-3 inline-flex items-center rounded border border-slate-200 px-3 py-1 text-[11px] uppercase tracking-[0.25em]"
                        :class="api ? 'text-slate-700' : 'text-slate-400'"
                    >
                        {{ api ? 'Client ready' : 'Waiting for config' }}
                    </div>
                </div>
                <button
                    type="button"
                    class="rounded border border-slate-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-400"
                    @click="$emit('update:showSettings', false)"
                >
                    Close
                </button>
            </header>

            <div class="grid gap-4 md:grid-cols-2">
                <label class="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Cluster ID
                    <input
                        v-model.trim="config.clusterId"
                        placeholder="cluster-id"
                        class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                </label>

                <label class="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Touchpoint
                    <input
                        v-model.trim="config.touchpoint"
                        placeholder="desktop"
                        class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                </label>

                <label class="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Customer Key
                    <input
                        v-model.trim="config.customerKey"
                        placeholder="customer-key"
                        class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                </label>

                <label class="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Session Key
                    <input
                        v-model.trim="config.sessionKey"
                        placeholder="session-key"
                        class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                </label>
            </div>

            <div>
                <h4 class="text-sm font-semibold text-slate-900">Client surface</h4>
                <p v-if="!api" class="mt-2 text-sm text-slate-500">
                    Client not initialized yet.
                </p>
                <ul v-else class="mt-2 grid gap-2 sm:grid-cols-2">
                    <li
                        v-for="key in apiKeys"
                        :key="key"
                        class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                        {{ key }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useElevateStore } from '@/stores/elevateStore'

const elevateStore = useElevateStore()
const { api, apiKeys, config } = storeToRefs(elevateStore)

defineProps<{
  showSettings: boolean;
}>()

defineEmits<{
  (e: 'update:showSettings', value: boolean): void;
}>()
</script>
