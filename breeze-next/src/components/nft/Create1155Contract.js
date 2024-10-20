import { useEffect, useState } from 'react'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { useAccount, useChainId } from 'wagmi'
import { createWalletClient, custom, createPublicClient } from 'viem'
import { BrowserProvider } from 'ethers'

const Create1155Contract = ({
    onContractCreated,
    onTransactionError,
    onTransactionConfirmed,
    contractName, // Recibir el nombre del contrato
    contractDescription, // Recibir la descripción del contrato
    contractImageUrl, // Recibir la URL de la imagen del contrato
    contractVideoUrl, // Recibir la URL del video del contrato
}) => {
    const chainId = useChainId()
    const { address: loggedInAddress } = useAccount()
    const [publicClient, setPublicClient] = useState(null)
    const [walletClient, setWalletClient] = useState(null)
    const [contractAddress, setContractAddress] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isContractCreated, setIsContractCreated] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false)

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

    const uploadMetadataToIpfs = async (
        contractName,
        contractDescription,
        contractImageUrl,
        contractVideoUrl,
    ) => {
        try {
            // Hacer una solicitud POST a la API de `uploadToIpfs`
            const response = await fetch('/api/upload-to-ipfs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contractName,
                    contractDescription,
                    contractImageUrl,
                    contractVideoUrl,
                }),
            })

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error('Failed to upload metadata to IPFS')
            }

            // Extraer los datos de la respuesta
            const data = await response.json()

            // Retornar los URIs de los metadatos
            return {
                contractMetadataUri: data.contractMetadataUri,
                tokenMetadataUri: data.tokenMetadataUri,
            }
        } catch (error) {
            console.error('Error uploading metadata:', error)
            throw error // Lanza el error para manejarlo donde se haga la llamada
        }
    }


    const createContract = async () => {
        if (isExecuting || loading || isContractCreated) {
            return
        }

        setIsExecuting(true)
        setLoading(true)

        try {
            // Llamar a la API para subir los metadatos a IPFS
            const { contractMetadataUri, tokenMetadataUri } =
                await uploadMetadataToIpfs(
                    contractName,
                    contractDescription,
                    contractImageUrl,
                    contractVideoUrl,
                )

            // Continuar con la creación del contrato usando las URIs obtenidas
            const creatorClient = createCreatorClient({
                chainId,
                publicClient,
            })

            const { parameters, contractAddress } =
                await creatorClient.create1155({
                    contract: {
                        name: contractName,
                        uri: contractMetadataUri, // Usar el hash de los metadatos del contrato subido a IPFS
                    },
                    token: {
                        tokenMetadataURI: tokenMetadataUri, // Usar el hash de los metadatos del token subido a IPFS
                    },
                    account: loggedInAddress,
                })

            setContractAddress(contractAddress)
            setIsContractCreated(true)

            if (onContractCreated) {
                onContractCreated(contractAddress)
            }

            // Simular la transacción antes de ejecutarla
            const simulation = await publicClient.simulateContract({
                ...parameters,
                account: loggedInAddress,
                chain: { id: chainId },
            })

            console.log('Simulation result:', simulation)

            // Escribir el contrato en la blockchain si la simulación es exitosa
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
                if (onTransactionConfirmed) {
                    onTransactionConfirmed(receipt)
                }
            } else {
                throw new Error('Transaction failed')
            }
        } catch (error) {
            console.error('Error creating contract:', error)
            if (onTransactionError) {
                onTransactionError(error.message)
            }
        } finally {
            setLoading(false)
            setIsExecuting(false)
        }
    }


    useEffect(() => {
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
