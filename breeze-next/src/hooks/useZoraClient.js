import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { publicClient, chainId } from '../lib/config'

export const useZoraClient = () => {
    const creatorClient = createCreatorClient({ chainId, publicClient })
    return creatorClient
}
