import {
    useAccount,
    useChainId,
    usePublicClient,
    useWriteContract,
} from 'wagmi'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { useEffect, useState } from 'react'

const Create1155Contract = () => {
    const chainId = useChainId()
    const publicClient = usePublicClient()
    const { address } = useAccount()
    const { writeContract } = useWriteContract()

    const [contractAddress, setContractAddress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const createContract = async () => {
            try {
                if (!address) {
                    throw new Error('Wallet not connected')
                }

                // Crea el cliente de Zora con el chainId y publicClient
                const creatorClient = createCreatorClient({
                    chainId,
                    publicClient,
                })

                // Crea el contrato 1155 en una dirección determinista
                const { parameters, contractAddress } =
                    await creatorClient.create1155({
                        contract: {
                            name: 'testContract',
                            uri: 'ipfs://DUMMY/contract.json',
                        },
                        token: {
                            tokenMetadataURI: 'ipfs://DUMMY/token.json',
                        },
                        account: address,
                    })

                // Almacena la dirección del contrato en el estado
                setContractAddress(contractAddress)

                // Ejecuta la transacción de contrato
                writeContract(parameters)
                setLoading(false)
            } catch (error) {
                console.error('Error creating contract:', error)
                setError(error.message)
                setLoading(false)
            }
        }

        // Ejecuta la función solo si la cuenta está conectada
        if (address && chainId && publicClient) {
            createContract()
        }
    }, [address, chainId, publicClient, writeContract])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div>
            Contract Address:{' '}
            {contractAddress ? contractAddress : 'Not available'}
        </div>
    )
}

export default Create1155Contract
