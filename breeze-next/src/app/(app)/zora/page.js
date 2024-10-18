'use client'
import { useState } from 'react'
import Create1155Contract from '../../../components/nft/Create1155Contract' // Corregir la importación
import MintToken from '../../../components/nft/MintToken'

function Zora() {
    const [contractAddress, setContractAddress] = useState('')

    const handleContractCreated = address => {
        setContractAddress(address)
    }

    return (
        <div>
            <h1>Create and Mint your ERC-1155</h1>
            {/* Pasar la función handleContractCreated como prop */}
            <Create1155Contract onContractCreated={handleContractCreated} />

            {/* Mostrar MintToken solo si hay contractAddress */}
            {contractAddress && <MintToken contractAddress={contractAddress} />}
        </div>
    )
}

export default Zora
