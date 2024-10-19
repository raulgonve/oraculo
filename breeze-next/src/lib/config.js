import { http, createConfig } from 'wagmi'
import { zora } from 'viem/chains'

// Crear configuración de wagmi con las cadenas y transporte HTTP
export const config = createConfig({
    chains: [zora],
    transports: {
        [zora.id]: http(),
    },
})
