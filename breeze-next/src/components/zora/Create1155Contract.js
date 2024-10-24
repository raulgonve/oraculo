import { useEffect, useState } from 'react'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { useAccount, useChainId } from 'wagmi'
import { createWalletClient, custom, createPublicClient } from 'viem'
import { BrowserProvider } from 'ethers'

const Create1155Contract = ({
    onContractCreated, // Callback function when the contract is created
    onTransactionError, // Callback function in case of a transaction error
    onTransactionConfirmed, // Callback function when the transaction is confirmed
    contractName, // Receive the contract name
    contractDescription, // Receive the contract description
    contractImageUrl, // Receive the contract image URL
    contractVideoUrl, // Receive the contract video URL
}) => {
    const chainId = useChainId() // Get the chainId from wagmi hooks
    const { address: loggedInAddress } = useAccount() // Get the logged-in user's address
    const [publicClient, setPublicClient] = useState(null) // State to manage the public client
    const [walletClient, setWalletClient] = useState(null) // State to manage the wallet client
    const [contractAddress, setContractAddress] = useState(null) // State to store the contract address
    const [loading, setLoading] = useState(false) // Loading state for async operations
    const [error, setError] = useState(null) // State to capture any errors
    const [isContractCreated, setIsContractCreated] = useState(false) // Flag to check if the contract is created
    const [isExecuting, setIsExecuting] = useState(false) // State to avoid multiple executions
    const [txHash, setTxHash] = useState(null) // State to store the transaction hash

    // Get the MetaMask provider and configure walletClient and publicClient
    useEffect(() => {
        ;(async function () {
            if (!window.ethereum) {
                console.error('Please install MetaMask!')
                return
            }
            const provider = new BrowserProvider(window.ethereum) // Get the MetaMask provider
            await provider.send('eth_requestAccounts', []) // Request access to the user's accounts
            const signer = await provider.getSigner() // Get the account signer

            // Create a wallet client using viem's createWalletClient function
            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: { id: chainId }, // Specify the chain ID
            })

            // Create a public client for public read operations
            const publicClient = createPublicClient({
                transport: custom(window.ethereum),
            })

            // Store the clients in state
            setWalletClient(walletClient)
            setPublicClient(publicClient)
        })()
    }, [chainId])

    // Function to upload metadata to IPFS
    const uploadMetadataToIpfs = async (
        contractName,
        contractDescription,
        contractImageUrl,
        contractVideoUrl,
    ) => {
        try {
            // Make a POST request to the upload-to-ipfs API endpoint
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

            // Check if the response was successful
            if (!response.ok) {
                throw new Error('Failed to upload metadata to IPFS')
            }

            // Extract the data from the response
            const data = await response.json()

            // Return the metadata URIs (contract and token)
            return {
                contractMetadataUri: data.contractMetadataUri,
                tokenMetadataUri: data.tokenMetadataUri,
            }
        } catch (error) {
            console.error('Error uploading metadata:', error)
            throw error // Re-throw the error to handle it where the function is called
        }
    }

    // Function to create the 1155 contract
    const createContract = async () => {
        // Avoid creating a contract if it's already executing, loading, or created
        if (isExecuting || loading || isContractCreated) {
            return
        }

        setIsExecuting(true) // Set the execution flag to true
        setLoading(true) // Set the loading state to true

        try {
            // Upload metadata to IPFS and get the URIs
            const { contractMetadataUri, tokenMetadataUri } =
                await uploadMetadataToIpfs(
                    contractName,
                    contractDescription,
                    contractImageUrl,
                    contractVideoUrl,
                )

            // Continue creating the contract using the URIs obtained
            const creatorClient = createCreatorClient({
                chainId,
                publicClient,
            })

            // Create the 1155 contract
            const { parameters, contractAddress } =
                await creatorClient.create1155({
                    contract: {
                        name: contractName,
                        uri: contractMetadataUri, // Use the metadata URI from IPFS
                    },
                    token: {
                        tokenMetadataURI: tokenMetadataUri, // Use the token metadata URI from IPFS
                    },
                    account: loggedInAddress, // The account creating the contract
                })

            setContractAddress(contractAddress) // Store the contract address
            setIsContractCreated(true) // Set the contract creation flag

            // Invoke the callback if provided
            if (onContractCreated) {
                onContractCreated(contractAddress)
            }

            // Simulate the contract before executing the transaction
            const simulation = await publicClient.simulateContract({
                ...parameters,
                account: loggedInAddress,
                chain: { id: chainId },
            })

            console.log('Simulation result:', simulation)

            // Write the contract to the blockchain if the simulation was successful
            const txHash = await walletClient.writeContract({
                ...parameters,
                account: loggedInAddress,
                chain: { id: chainId },
            })

            console.log('Transaction sent, hash:', txHash)

            // Store the transaction hash
            setTxHash(txHash)

            // Wait for the transaction receipt (confirmation)
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
            })

            // Check if the transaction was successful
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
            setLoading(false) // Reset the loading state
            setIsExecuting(false) // Reset the execution flag
        }
    }

    // Effect to create the contract when all conditions are met
    useEffect(() => {
        if (
            loggedInAddress &&
            walletClient &&
            publicClient &&
            !isContractCreated &&
            !loading
        ) {
            createContract() // Call the contract creation function
        }
    }, [
        loggedInAddress,
        walletClient,
        publicClient,
        isContractCreated,
        loading,
    ])

    // Show loading state if the contract creation is in progress
    if (loading) {
        return <div>Loading...</div>
    }

    // Show error message if any error occurs
    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div>
            <p>
                Contract Address:{' '}
                {contractAddress ? contractAddress : 'Not available'}
            </p>

            {/* Show the transaction explorer link if the transaction hash is available */}
            {txHash && (
                <p>
                    Transaction Explorer:{' '}
                    <a
                        href={`https://explorer.zora.energy/tx/${txHash}`} // Adjust the explorer link according to the network
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'blue', textDecoration: 'underline' }}>
                        View on Explorer
                    </a>
                </p>
            )}
        </div>
    )
}

export default Create1155Contract
