'use client'
import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi' // Hooks to get the user's account and current chain ID
import { createCollectorClient } from '@zoralabs/protocol-sdk' // Zora SDK for creating a collector client
import { createPublicClient, createWalletClient, custom } from 'viem' // Viem to create clients for public and wallet
import { zora } from 'viem/chains' // Chain configuration for Zora

const MintToken = ({ contractAddress }) => {
    const { address } = useAccount() // Get the user's account address
    const chainId = useChainId() // Get the current chain ID
    const [status, setStatus] = useState('') // Store the status message of the minting process
    const [loading, setLoading] = useState(false) // Loading state to prevent multiple executions
    const [simulationError, setSimulationError] = useState(null) // State to handle simulation errors
    const [minted, setMinted] = useState(false) // Track if the token has been minted
    const [txHash, setTxHash] = useState(null) // Store the transaction hash

    // Function to handle the minting of the token
    const handleMintToken = async () => {
        if (loading || minted) return // Prevent multiple execution if minting is already in progress or completed

        setLoading(true) // Set the loading state to true
        setSimulationError(null) // Reset any previous simulation errors
        try {
            console.log('Simulating transaction...') // Initial log message
            setStatus('Simulating transaction...')

            // Get MetaMask provider
            const provider = window.ethereum
            if (!provider) {
                throw new Error('MetaMask not installed')
            }

            // Set up walletClient and publicClient using MetaMask provider
            const walletClient = createWalletClient({
                chain: zora,
                transport: custom(provider), // Use MetaMask for signing transactions
            })

            const publicClient = createPublicClient({
                chain: zora,
                transport: custom(provider), // Use the same provider for read operations
            })

            console.log('Wallet client and public client created')

            // Create the Zora Collector client
            const collectorClient = createCollectorClient({
                chainId,
                publicClient,
            })

            // Prepare the minting transaction
            const { parameters } = await collectorClient.mint({
                tokenContract: contractAddress, // The contract address of the ERC-1155 token
                mintType: '1155', // The mint type (ERC-1155)
                tokenId: 1n, // The ID of the token to mint
                quantityToMint: 1, // Number of tokens to mint
                mintComment: 'My comment', // Optional comment
                minterAccount: address, // The account initiating the mint
            })

            if (!parameters) {
                throw new Error('Mint parameters are undefined')
            }

            // Simulate the transaction before sending it
            const simulation = await publicClient.simulateContract({
                ...parameters,
                account: address, // Set the account that will mint
                chain: { id: chainId }, // Use the current chain ID
            })

            if (simulation.result) {
                console.log('Simulation result:', simulation)
            } else {
                console.warn(`Simulation failed: ${simulation.error}`)
                setSimulationError(simulation.error) // Store the error in state
            }

            // If the simulation was successful, write the contract to the blockchain
            console.log('Writing contract to blockchain...')
            const txHash = await walletClient.writeContract({
                ...parameters,
                account: address, // The account executing the transaction
            })

            if (!txHash) {
                throw new Error('Transaction hash is undefined')
            }

            // Store the transaction hash in state
            setTxHash(txHash)

            console.log('Transaction sent, hash:', txHash)
            setStatus('Transaction sent, hash: ' + txHash)

            // Wait for the transaction to be confirmed
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash, // Use the transaction hash to track confirmation
            })

            if (receipt.status === 'success') {
                setStatus('Token minted successfully!')
                setMinted(true) // Mark the token as minted
                console.log('Transaction confirmed:', receipt)
            } else {
                throw new Error('Transaction failed')
            }
        } catch (error) {
            console.error('Error minting token:', error)
            setStatus('Error minting token: ' + error.message) // Set the error status message
        } finally {
            setLoading(false) // Stop the loading state once the process is finished
        }
    }

    // Automatically execute the minting process when the component mounts
    useEffect(() => {
        if (contractAddress && !loading && !minted && !simulationError) {
            handleMintToken() // Start the minting process when the contract address is available
        }
    }, [contractAddress, loading, minted, simulationError])

    return (
        <div>
            <p>{status}</p>{' '}
            {/* Display the current status of the minting process */}
            {/* Show the transaction explorer link if the transaction hash is available */}
            {txHash && (
                <p>
                    Transaction Explorer:{' '}
                    <a
                        href={`https://explorer.zora.energy/tx/${txHash}`} // Adjust the explorer link based on the network
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'blue', textDecoration: 'underline' }}>
                        View on Explorer
                    </a>
                </p>
            )}
            {/* Show any simulation errors */}
            {simulationError && (
                <p style={{ color: 'red' }}>
                    Simulation Error: {simulationError}
                </p>
            )}
        </div>
    )
}

export default MintToken
