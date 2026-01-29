import { computed, reactive, ref, watch } from 'vue'
import { useElevate, type ElevateConfig } from './useElevate'

export type MarketOption = {
  locale: string
  market: string
}

const LOCAL_CUSTOMER_KEY = 'elevate-debugger-customer-key'
const SESSION_KEY = 'elevate-debugger-session-key'

const ELEVATE_MARKETS: MarketOption[] = [
    { locale: 'de-at', market: 'string_at' },
    { locale: 'de-de', market: 'string_de' },
    { locale: 'en-dk', market: 'string_dk' },
    { locale: 'en-nl', market: 'string_nl' },
    { locale: 'en-be', market: 'string_be' },
    { locale: 'es-es', market: 'string_es' },
    { locale: 'en-pt', market: 'string_pt' },
    { locale: 'fr-fr', market: 'string_fr' },
    { locale: 'fr-nl', market: 'string_nl' },
    { locale: 'fr-be', market: 'string_be' },
    { locale: 'sv-se', market: 'string_se' },
    { locale: 'en-no', market: 'string_no' },
    { locale: 'ja-jp', market: 'string_jp' },
    { locale: 'zh-cn', market: 'string_cn' },
    { locale: 'ko-kr', market: 'string_kr' },
    { locale: 'en-it', market: 'string_it' },
    { locale: 'it-it', market: 'string_it' },
    { locale: 'en-pl', market: 'string_pl' },
    { locale: 'pl-pl', market: 'string_pl' },
    { locale: 'en-150', market: 'string_global' },
    { locale: 'default', market: 'string_global' },
]

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

export const useElevateDebugger = () => {
    const selectedLocale = ref('en-150')

    const config = reactive<ElevateConfig>({
        clusterId: import.meta.env.VITE_ELEVATE_CLUSTER_ID ?? '',
        market: 'string_global',
        locale: 'en-150',
        touchpoint: 'desktop',
        customerKey: getOrCreateCustomerKey(),
        sessionKey: getOrCreateSessionKey(),
    })

    watch(selectedLocale, (value) => {
        const entry = ELEVATE_MARKETS.find((item) => item.locale === value)

        if (entry) {
            config.locale = entry.locale
            config.market = entry.market
        }
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
        selectedLocale,
    }
}
