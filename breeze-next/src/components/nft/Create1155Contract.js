import { useEffect, useState } from 'react'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { useAccount, useChainId } from 'wagmi'
import { createWalletClient, custom, createPublicClient } from 'viem'
import { BrowserProvider } from 'ethers'

const Create1155Contract = ({
    onContractCreated,
    onTransactionError,
    onTransactionConfirmed,
}) => {
    const chainId = useChainId()
    const { address: loggedInAddress } = useAccount()
    const [publicClient, setPublicClient] = useState(null)
    const [walletClient, setWalletClient] = useState(null)
    const [contractAddress, setContractAddress] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isContractCreated, setIsContractCreated] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false) // Estado para evitar múltiples ejecuciones

    // Obtener el proveedor de MetaMask y configurar walletClient y publicClient
    useEffect(() => {
        ;(async function () {
            if (!window.ethereum) {
                console.error('Please install MetaMask!')
                return
            }
            const provider = new BrowserProvider(window.ethereum)
            await provider.send('eth_requestAccounts', [])
            const signer = await provider.getSigner()

            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: { id: chainId },
            })

            const publicClient = createPublicClient({
                transport: custom(window.ethereum),
            })

            setWalletClient(walletClient)
            setPublicClient(publicClient)
        })()
    }, [chainId])

    const createContract = async () => {
        // Verificar si ya se está ejecutando o si el contrato ya se creó o está cargando
        if (isExecuting || loading || isContractCreated) {
            console.log(
                'Contract creation or transaction is already in progress',
            )
            return
        }

        setIsExecuting(true) // Bloquear ejecuciones múltiples
        setLoading(true) // Iniciar la carga

        try {
            const creatorClient = createCreatorClient({
                chainId,
                publicClient,
            })

            const { parameters, contractAddress } =
                await creatorClient.create1155({
                    contract: {
                        name: 'testContract20',
                        uri: 'ipfs.io/ipfs/Qmdj5Lq1LzEFEH3WvstPLcLrnVFxt9n6bV8iGMa9qAeLvW',
                    },
                    token: {
                        tokenMetadataURI:
                            'ipfs.io/ipfs/QmeD7CBtjZe4Yc3KzfuR5xyvT3oMn2AzGjEXnEbdTht65a',
                    },
                    account: loggedInAddress,
                })

            setContractAddress(contractAddress)
            setIsContractCreated(true)

            if (onContractCreated) {
                onContractCreated(contractAddress)
            }

            // Simular la llamada al contrato antes de enviar la transacción
            const simulation = await publicClient.simulateContract({
                ...parameters,
                account: loggedInAddress,
                chain: { id: chainId },
            })

            console.log('Simulation result:', simulation)

            if (simulation.error) {
                throw new Error(`Simulation failed: ${simulation.error}`)
            }

            // Enviar la transacción si la simulación es exitosa
            const txHash = await walletClient.writeContract({
                ...parameters,
                account: loggedInAddress,
                chain: { id: chainId },
            })

            console.log('Transaction sent, hash:', txHash)

            // Esperar la confirmación de la transacción
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
            })

            if (receipt.status === 'success') {
                console.log('Transaction confirmed:', receipt)
                if (onTransactionConfirmed) {
                    onTransactionConfirmed(receipt)
                }
            } else {
                throw new Error('Transaction failed')
            }
        } catch (error) {
            console.error('Error creating contract:', error)
            setError(error.message)
            if (onTransactionError) {
                onTransactionError(error.message)
            }
        } finally {
            setLoading(false) // Finalizar la carga
            setIsExecuting(false) // Desbloquear ejecuciones
        }
    }

    useEffect(() => {
        // Asegurarse de que solo se ejecute una vez cuando las dependencias estén listas
        if (
            loggedInAddress &&
            walletClient &&
            publicClient &&
            !isContractCreated &&
            !loading
        ) {
            createContract()
        }
    }, [
        loggedInAddress,
        walletClient,
        publicClient,
        isContractCreated,
        loading,
    ])

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
