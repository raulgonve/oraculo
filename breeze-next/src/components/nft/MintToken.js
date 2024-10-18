'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import useZoraClient from '../../hooks/useZoraClient'
import alchemy from '../../lib/alchemyClient' // Importa el cliente de Alchemy

function MintToken({ contractAddress }) {
    const [quantity, setQuantity] = useState(1)
    const [status, setStatus] = useState('')
    const { address } = useAccount() // Obtener la cuenta conectada
    const creatorClient = useZoraClient()

    const handleMint = async () => {
        try {
            setStatus('Minting token...')

            // Preparar el minteo
            const { prepareMint } =
                await creatorClient.create1155OnExistingContract({
                    contractAddress,
                    token: {
                        tokenMetadataURI: 'ipfs://your_token_metadata.json',
                    },
                    account: address,
                })

            // Preparar la transacción de mint
            const { parameters: mintParams } = await prepareMint({
                quantityToMint: BigInt(quantity),
                minterAccount: address,
            })

            // Enviar la transacción usando Alchemy
            const txHash = await alchemy.transact(mintParams)

            setStatus(`Token minted successfully! Transaction Hash: ${txHash}`)
        } catch (error) {
            console.error(error)
            setStatus('Error minting token.')
        }
    }

    return (
        <div>
            <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="border p-2 m-2"
            />
            <button onClick={handleMint} className="bg-blue-500 p-2 rounded">
                Mint Token
            </button>
            <p>{status}</p>
        </div>
    )
}

export default MintToken
