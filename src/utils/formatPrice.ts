import { useElevateStore } from '@/stores/elevateStore'
import type { Product } from '@apptus/esales-api'

export const formatPrice = (product: Product) => {
    const elevateStore = useElevateStore()
    const currency = elevateStore.elevateCurrencies[elevateStore.config.market]

    if (!currency) {
        return ''
    }

    const { min, max } = product.sellingPrice

    return min === max ? `${min} ${currency}` : `${min} - ${max} ${currency}`
}
