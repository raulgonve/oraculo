import { http, createConfig } from 'wagmi'
import { zoraSepolia, zora } from 'viem/chains'

// Crear configuración de wagmi con las cadenas y transporte HTTP
export const config = createConfig({
    chains: [zoraSepolia, zora],
    transports: {
        [zoraSepolia.id]: http(),
        [zora.id]: http(),
    },
})
