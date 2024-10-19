'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { createPublicClient, http } from 'viem'
import { zora } from 'viem/chains'

const MintToken = ({ contractAddress }) => {
    const { address } = useAccount()
    const [status, setStatus] = useState('')

    const publicClient = createPublicClient({
        chain: zora,
        transport: http(
            `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        ),
    })

    const creatorClient = createCreatorClient({
        chainId: zora.id,
        publicClient,
    })

    const handleMintToken = async () => {
        try {
            const { prepareMint } =
                await creatorClient.create1155OnExistingContract({
                    contractAddress,
                    token: { tokenMetadataURI: 'ipfs://token-uri' },
                    account: address,
                })

            const { parameters: mintParams } = await prepareMint({
                quantityToMint: BigInt(1),
                minterAccount: address,
            })

            await publicClient.writeContract(mintParams)
            setStatus('Token minted successfully!')
        } catch (error) {
            console.error('Error minting token', error)
            setStatus('Error minting token.')
        }
    }

    return (
        <div>
            <button onClick={handleMintToken}>Mint Token</button>
            <p>{status}</p>
        </div>
    )
}

export default MintToken
