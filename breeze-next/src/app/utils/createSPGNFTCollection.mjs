import pkg from '@story-protocol/core-sdk' // Importación del paquete completo
const { StoryClient, StoryConfig } = pkg // Extraer las partes necesarias del paquete
import { http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

async function createSPGNFTCollection() {
    try {
        // Obtener las variables de entorno para la clave privada y el RPC
        const privateKey = `0x${process.env.WALLET_PRIVATE_KEY}`
        const rpcProvider = process.env.RPC_PROVIDER_URL

        if (!privateKey || !rpcProvider) {
            console.error('Missing environment variables.')
            return
        }

        // Crear cuenta y configuración de cliente
        const account = privateKeyToAccount(privateKey)
        const config = {
            account: account,
            transport: http(rpcProvider),
            chainId: 'iliad',
        }

        // Inicializar StoryClient
        const client = StoryClient.newClient(config)

        // Crear la colección NFT
        const newCollection = await client.nftClient.createNFTCollection({
            name: 'Astral Test NFT',
            symbol: 'ASTRAL',
            txOptions: { waitForTransaction: true },
        })

        // Mostrar resultados en la consola
        console.log(
            `New SPG NFT collection created at transaction hash ${newCollection.txHash}`,
            `NFT contract address: ${newCollection.nftContract}`,
        )
    } catch (error) {
        console.error('Error creating NFT collection:', error)
    }
}

// Ejecutar la función inmediatamente
;(async () => {
    await createSPGNFTCollection()
})()
