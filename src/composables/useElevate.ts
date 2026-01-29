import { elevate, type Touchpoint } from '@apptus/esales-api'

export interface ElevateConfig {
    clusterId: string
    market: string
    locale: string
    touchpoint: Touchpoint
    customerKey: string
    sessionKey: string
}

export function useElevate(config: ElevateConfig) {
    if (!config?.clusterId) {
        console.warn('Elevate config missing clusterId')
    }

    return elevate({
        clusterId: config.clusterId,
        market: config.market,
        locale: config.locale,
        touchpoint: config.touchpoint,
        session: () => {
            return { customerKey: config.customerKey, sessionKey: config.sessionKey }
        },
    })
}
