'use client'
import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { createCollectorClient } from '@zoralabs/protocol-sdk'
import { createPublicClient, createWalletClient, custom } from 'viem'
import { zora } from 'viem/chains'

const MintToken = ({ contractAddress }) => {
    const { address } = useAccount() // Obtener la cuenta del usuario
    const chainId = useChainId() // Obtener el chainId
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false) // Estado de carga para evitar múltiples ejecuciones
    const [simulationError, setSimulationError] = useState(null) // Estado para manejar errores de simulación
    const [minted, setMinted] = useState(false) // Estado para evitar la segunda ejecución

    const handleMintToken = async () => {
        if (loading || minted) return // Si ya está en proceso o ya se minteó, no hacer nada

        setLoading(true) // Iniciar el estado de carga
        setSimulationError(null) // Reiniciar el estado de errores de simulación
        try {
            console.log('Simulating transaction...') // Log inicial
            setStatus('Simulating transaction...')

            // Obtener el proveedor de MetaMask
            const provider = window.ethereum
            if (!provider) {
                throw new Error('MetaMask not installed')
            }

            // Configurar walletClient y publicClient utilizando el proveedor de MetaMask
            const walletClient = createWalletClient({
                chain: zora,
                transport: custom(provider), // Usar el proveedor de MetaMask para firmar transacciones
            })

            const publicClient = createPublicClient({
                chain: zora,
                transport: custom(provider), // Usar el mismo proveedor para llamadas de lectura
            })

            console.log('Wallet client and public client created')

            // Crear el cliente de Zora Collector
            const collectorClient = createCollectorClient({
                chainId,
                publicClient,
            })

            // Preparar la transacción de minteo
            const { parameters } = await collectorClient.mint({
                tokenContract: contractAddress, // Dirección del contrato 1155
                mintType: '1155', // Tipo de minteo
                tokenId: 1n, // El ID del token que queremos mintear
                quantityToMint: 1, // Cantidad de tokens que queremos mintear
                mintComment: 'My comment', // Comentario opcional
                minterAccount: address, // Cuenta del minter (quien mintea)
            })

            if (!parameters) {
                throw new Error('Mint parameters are undefined')
            }

            // Simular la transacción antes de ejecutarla
            const simulation = await publicClient.simulateContract({
                ...parameters,
                account: address,
                chain: { id: chainId },
            })

            if (simulation.result) {
                console.log('Simulation result:', simulation)
            } else {
                console.warn(`Simulation failed: ${simulation.error}`)
                setSimulationError(simulation.error) // Guardar el error en el estado
            }

            // Si la simulación fue exitosa, escribir el contrato
            console.log('Writing contract to blockchain...')
            const txHash = await walletClient.writeContract({
                ...parameters,
                account: address,
            })

            if (!txHash) {
                throw new Error('Transaction hash is undefined')
            }

            console.log('Transaction sent, hash:', txHash)
            setStatus('Transaction sent, hash: ' + txHash)

            // Esperar la confirmación de la transacción
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
            })

            if (receipt.status === 'success') {
                setStatus('Token minted successfully!')
                setMinted(true) // Marcar como minteado
                console.log('Transaction confirmed:', receipt)
            } else {
                throw new Error('Transaction failed')
            }
        } catch (error) {
            console.error('Error minting token:', error)
            setStatus('Error minting token: ' + error.message)
        } finally {
            setLoading(false) // Detener el estado de carga al final del proceso
        }
    }

    // Ejecutar handleMintToken cuando el componente se monte, solo una vez
    useEffect(() => {
        if (contractAddress && !loading && !minted && !simulationError) {
            handleMintToken()
        }
    }, [contractAddress, loading, minted, simulationError])

    return (
        <div>
            <p>{status}</p>
            {simulationError && (
                <p style={{ color: 'red' }}>
                    Simulation Error: {simulationError}
                </p>
            )}
        </div>
    )
}

export default MintToken
