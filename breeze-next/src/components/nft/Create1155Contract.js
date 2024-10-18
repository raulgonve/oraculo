'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import useZoraClient from '../../hooks/useZoraClient'
import alchemy from '../../lib/alchemyClient'

function Create1155Contract({ onContractCreated }) {
    // Recibe el prop onContractCreated
    const { address } = useAccount()
    const creatorClient = useZoraClient()
    const [contractName, setContractName] = useState('')
    const [contractUri, setContractUri] = useState('')
    const [tokenUri, setTokenUri] = useState('')
    const [status, setStatus] = useState('')

    const handleCreateContract = async () => {
        try {
            setStatus('Creating contract...')

            const { parameters, contractAddress } =
                await creatorClient.create1155({
                    contract: { name: contractName, uri: contractUri },
                    token: { tokenMetadataURI: tokenUri },
                    account: address,
                })

            const txHash = await alchemy.transact(parameters)

            setStatus(
                `Contract created at: ${contractAddress} \n Transaction Hash: ${txHash}`,
            )

            // Pasar la dirección del contrato al componente padre
            onContractCreated(contractAddress)
        } catch (error) {
            console.error(error)
            setStatus('Error creating contract.')
        }
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Contract Name"
                value={contractName}
                onChange={e => setContractName(e.target.value)}
                className="border p-2 m-2"
            />
            <input
                type="text"
                placeholder="Contract URI"
                value={contractUri}
                onChange={e => setContractUri(e.target.value)}
                className="border p-2 m-2"
            />
            <input
                type="text"
                placeholder="Token URI"
                value={tokenUri}
                onChange={e => setTokenUri(e.target.value)}
                className="border p-2 m-2"
            />
            <button
                onClick={handleCreateContract}
                className="bg-blue-500 p-2 rounded">
                Create Contract
            </button>
            <p>{status}</p>
        </div>
    )
}

export default Create1155Contract
