import { useEffect, useState } from 'react'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import {
    useAccount,
    useChainId,
    usePublicClient,
    useWriteContract,
} from 'wagmi'

const Create1155Contract = ({
    onContractCreated,
    onTransactionConfirmed,
    onTransactionError,
}) => {
    const chainId = useChainId()
    const publicClient = usePublicClient()
    const { address } = useAccount()
    const { writeContract } = useWriteContract()

    const [contractAddress, setContractAddress] = useState(null)
    const [parameters, setParameters] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isContractCreated, setIsContractCreated] = useState(false)
    const [isTransactionSent, setIsTransactionSent] = useState(false)

    // Separar las funciones para evitar múltiples ejecuciones
    const createContract = async () => {
        if (!address || loading || isContractCreated) {
            console.log('Exiting createContract early: Conditions not met', {
                address,
                loading,
                isContractCreated,
            })
            return // Evitar múltiples ejecuciones
        }

        try {
            console.log('Creating contract...')
            setLoading(true) // Bloquear ejecuciones múltiples
            setError(null) // Limpiar error anterior

            // Crear el cliente de Zora
            const creatorClient = createCreatorClient({
                chainId,
                publicClient,
            })

            // Crear el contrato 1155
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

            console.log('Contract created successfully:', { contractAddress })

            setContractAddress(contractAddress)
            setParameters(parameters)
            setIsContractCreated(true) // Marcar como contrato creado

            if (onContractCreated) {
                onContractCreated(contractAddress) // Informar al componente padre
            }

            setLoading(false) // Terminar el estado de carga
        } catch (error) {
            console.error('Error creating contract:', error)
            setError(error.message)

            if (onTransactionError) {
                onTransactionError(error.message) // Informar del error
            }

            setLoading(false) // Detener el estado de carga en caso de error
        }
    }

    const executeTransaction = async parameters => {
        if (!isContractCreated || !parameters || isTransactionSent) {
            console.log(
                'Exiting executeTransaction early: Conditions not met',
                { isContractCreated, parameters, isTransactionSent },
            )
            return // Prevenir múltiples ejecuciones
        }

        try {
            console.log('Executing transaction...')
            setLoading(true) // Iniciar el estado de carga
            setError(null) // Limpiar errores previos

            // Verificar que writeContract esté correctamente configurado
            if (!writeContract) {
                console.error('writeContract is not defined properly')
                throw new Error('writeContract is undefined or misconfigured')
            }

            const txResponse = await writeContract(parameters) // Ejecutar transacción

            if (!txResponse) {
                console.error('Transaction response is undefined. Aborting.')
                throw new Error('Transaction response is undefined')
            }

            console.log('Transaction response received:', { txResponse })

            setIsTransactionSent(true) // Marcar la transacción como enviada

            // Esperar la confirmación de la transacción
            const receipt = await txResponse.wait()

            if (receipt.status === 1) {
                console.log('Transaction confirmed:', { receipt })
                if (onTransactionConfirmed) {
                    onTransactionConfirmed() // Informar al componente padre si se confirma la transacción
                }
            } else {
                throw new Error('Transaction failed') // Si la transacción falló
            }

            setLoading(false) // Terminar el estado de carga
        } catch (error) {
            console.error('Error executing transaction:', error)
            setError(error.message)

            if (onTransactionError) {
                onTransactionError(error.message) // Informar del error
            }

            setLoading(false) // Detener el estado de carga en caso de error
        }
    }

    // Solo crear el contrato si no ha sido creado
    useEffect(() => {
        console.log(
            'useEffect triggered: Checking if we need to create a contract',
        )
        if (address && chainId && publicClient && !isContractCreated) {
            createContract()
        }
    }, [address, chainId, publicClient, isContractCreated])

    // Solo ejecutar la transacción si el contrato ha sido creado
    useEffect(() => {
        console.log(
            'useEffect triggered: Checking if we need to execute the transaction',
        )
        if (isContractCreated && !isTransactionSent && parameters) {
            executeTransaction(parameters)
        }
    }, [isContractCreated, isTransactionSent, parameters, writeContract])

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
