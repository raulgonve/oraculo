'use client'
import { useState } from 'react'
import Create1155Contract from '../../../components/nft/Create1155Contract'
import MintToken from '../../../components/nft/MintToken'

function ZoraPage() {
    const [contractAddress, setContractAddress] = useState('')

    const handleContractCreated = address => {
        setContractAddress(address)
    }

    return (
        <div>
            <h1>Create and Mint your ERC-1155</h1>
            <Create1155Contract onContractCreated={handleContractCreated} />
            {contractAddress && <MintToken contractAddress={contractAddress} />}
        </div>
    )
}

export default ZoraPage
