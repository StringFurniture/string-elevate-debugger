import { computed, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useElevate, type ElevateConfig } from '../composables/useElevate'

export type MarketOption = {
  locale: string
  market: string
}

const LOCAL_CUSTOMER_KEY = 'elevate-debugger-customer-key'
const SESSION_KEY = 'elevate-debugger-session-key'

const ELEVATE_MARKETS: MarketOption[] = [
    { locale: 'de-DE', market: 'string_at' },
    { locale: 'en-150', market: 'string_be' },
    { locale: 'fr-FR', market: 'string_be' },
    { locale: 'zh-CN', market: 'string_cn' },
    { locale: 'de-DE', market: 'string_de' },
    { locale: 'en-150', market: 'string_dk' },
    { locale: 'es-ES', market: 'string_es' },
    { locale: 'fr-FR', market: 'string_fr' },
    { locale: 'en-150', market: 'string_gb' },
    { locale: 'en-150', market: 'string_global' },
    { locale: 'en-150', market: 'string_it' },
    { locale: 'it-IT', market: 'string_it' },
    { locale: 'ja-JP', market: 'string_jp' },
    { locale: 'ko-KR', market: 'string_kr' },
    { locale: 'en-150', market: 'string_nl' },
    { locale: 'fr-FR', market: 'string_nl' },
    { locale: 'en-150', market: 'string_no' },
    { locale: 'en-150', market: 'string_pl' },
    { locale: 'pl-PL', market: 'string_pl' },
    { locale: 'en-150', market: 'string_pt' },
    { locale: 'sv-SE', market: 'string_se' },
    // { locale: 'default', market: 'string_global' },
]

const ELEVATE_CURRENCIES: Record<string, string> = {
    string_at: 'EUR',
    string_de: 'EUR',
    string_dk: 'DKK',
    string_nl: 'EUR',
    string_be: 'EUR',
    string_es: 'EUR',
    string_pt: 'EUR',
    string_fr: 'EUR',
    string_se: 'SEK',
    string_no: 'NOK',
    string_jp: 'JPY',
    string_cn: 'CNY',
    string_kr: 'KRW',
    string_it: 'EUR',
    string_pl: 'PLN',
    string_gb: 'GBP',
    string_global: '-',
}

const generateKey = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const getOrCreateCustomerKey = () => {
    const envKey = import.meta.env.VITE_ELEVATE_CUSTOMER_KEY as string | undefined
    if (envKey) return envKey

    const stored = localStorage.getItem(LOCAL_CUSTOMER_KEY)
    if (stored) return stored

    const key = generateKey()
    localStorage.setItem(LOCAL_CUSTOMER_KEY, key)

    return key
}

const getOrCreateSessionKey = () => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) return stored

    const key = generateKey()
    sessionStorage.setItem(SESSION_KEY, key)

    return key
}

const resolveMarketSelection = (value: string | null) => {
    if (!value) return 'string_global'

    const marketEntry = ELEVATE_MARKETS.find((item) => item.market === value)
    if (marketEntry) return marketEntry.market

    const localeEntry = ELEVATE_MARKETS.find((item) => item.locale === value)
    if (localeEntry) return localeEntry.market

    return 'string_global'
}

export const useElevateStore = defineStore('elevate', () => {
    const persistedSelection = localStorage.getItem('elevate-debugger-locale')
    const selectedMarket = ref(resolveMarketSelection(persistedSelection))

    const applySelection = (value: string) => {
        const entry = ELEVATE_MARKETS.find((item) => item.market === value)

        if (entry) {
            config.locale = entry.locale
            config.market = entry.market
        }
    }

    const config = reactive<ElevateConfig>({
        clusterId: import.meta.env.VITE_ELEVATE_CLUSTER_ID ?? '',
        market: 'string_global',
        locale: 'en-150',
        touchpoint: 'desktop',
        customerKey: getOrCreateCustomerKey(),
        sessionKey: getOrCreateSessionKey(),
    })

    applySelection(selectedMarket.value)

    watch(selectedMarket, (value) => {
        applySelection(value)
    })

    watch(selectedMarket, (value) => {
        localStorage.setItem('elevate-debugger-locale', value)
    })

    const api = ref<ReturnType<typeof useElevate> | null>(null)

    watch(
        config,
        (value) => {
            api.value = useElevate({ ...value })
        },
        { deep: true, immediate: true },
    )

    const apiKeys = computed(() => (api.value ? Object.keys(api.value).sort() : []))

    return {
        api,
        apiKeys,
        config,
        elevateMarkets: ELEVATE_MARKETS,
        selectedMarket,
        elevateCurrencies: ELEVATE_CURRENCIES,
    }
})
