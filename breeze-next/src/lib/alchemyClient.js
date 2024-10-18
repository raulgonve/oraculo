import { Alchemy, Network } from 'alchemy-sdk'

// Configuración de Alchemy
const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY, // La clave API desde .env
    network: Network.ETH_MAINNET, // O la red que prefieras como Zora o Goerli
}

// Crear la instancia del cliente de Alchemy
const alchemy = new Alchemy(settings)

export default alchemy
