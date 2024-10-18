import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { createPublicClient, http } from 'viem'
import { zora } from 'viem/chains'

const useZoraClient = () => {
    // Usamos Zora como la red
    const chainId = zora.id

    // Crear el publicClient con el API Key de Alchemy
    const publicClient = createPublicClient({
        chain: zora, // Usamos Zora como la cadena
        transport: http(
            `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        ),
    })

    // Crear el creatorClient con el publicClient generado
    const creatorClient = createCreatorClient({
        chainId,
        publicClient,
    })

    return creatorClient
}

export default useZoraClient
