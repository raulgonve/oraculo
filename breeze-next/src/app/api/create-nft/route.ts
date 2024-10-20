import { NextResponse } from 'next/server'
import {
    StoryClient,
    StoryConfig,
    IpMetadata,
    PIL_TYPE,
    CreateIpAssetWithPilTermsResponse,
} from '@story-protocol/core-sdk'
import { http, Address } from 'viem'
import { privateKeyToAccount, Account } from 'viem/accounts'
import { uploadJSONToIPFS } from '../../utils/uploadToIpfs'
import { createHash } from 'crypto'

export async function POST(req: Request) {
    try {
        // Recibe los prompts y los datos astrológicos del usuario
        const { imageUrl, userAstroData, prompt } = await req.json()

        const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`
        const account: Account = privateKeyToAccount(privateKey)

        const rpcProvider = process.env.RPC_PROVIDER_URL

        if (!privateKey || !rpcProvider) {
            return new NextResponse(
                JSON.stringify({ error: 'Missing environment variables' }),
                { status: 500 },
            )
        }

        // Initialize the account and StoryClient
        const config: StoryConfig = {
            account: account,
            transport: http(rpcProvider),
            chainId: 'iliad',
        }

        const client = StoryClient.newClient(config)
        const isNsfw = 'false'

        // Create IP metadata with userAstroData and image attributes
        const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
            title: `Astrological IP NFT: Personalized for ${userAstroData.name}`,
            description: `Generated based on the user's astrological data. Sign: ${userAstroData.sun}, Ascendant: ${userAstroData.ascendant}, Moon: ${userAstroData.moon}`,
            attributes: [
                {
                    key: 'Sun Sign',
                    value: userAstroData.sun || 'Unknown',
                },
                {
                    key: 'Moon Sign',
                    value: userAstroData.moon || 'Unknown',
                },
                {
                    key: 'Ascendant',
                    value: userAstroData.ascendant || 'Unknown',
                },
                {
                    key: 'Date of Birth',
                    value: userAstroData.birthDate || 'Unknown',
                },
                {
                    key: 'Time of Birth',
                    value: userAstroData.birthTime || 'Unknown',
                },
                {
                    key: 'Place of Birth',
                    value: userAstroData.birthPlace || 'Unknown',
                },
                {
                    key: 'NSFW',
                    value: isNsfw, // Adding the NSFW status of the generated image
                },
                {
                    key: 'AI Generated',
                    value: 'true', // Indicating that the image is AI-generated
                },
                {
                    key: 'Image URL',
                    value: imageUrl, // URL of the generated image
                },
            ],
        })

        const nftMetadata = {
            name: `IP Astrological NFT for ${userAstroData.name}`,
            description: prompt || 'Astrological NFT',
            image: imageUrl,
            imageFile: imageUrl,
            mediaUrl: imageUrl,
            thumbnailUrl: imageUrl,
        }

        // Upload metadata to IPFS
        const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
        const ipHash = createHash('sha256')
            .update(JSON.stringify(ipMetadata))
            .digest('hex')
        const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
        const nftHash = createHash('sha256')
            .update(JSON.stringify(nftMetadata))
            .digest('hex')

        // Mint and register the IP asset on the blockchain
        const response: CreateIpAssetWithPilTermsResponse =
            await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
                nftContract: process.env.NFT_CONTRACT_ADDRESS as Address,
                pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
                ipMetadata: {
                    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
                    ipMetadataHash: `0x${ipHash}`,
                    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
                    nftMetadataHash: `0x${nftHash}`,
                },
                txOptions: { waitForTransaction: true },
            })

        // Retorna los detalles del NFT generado
        return new NextResponse(
            JSON.stringify({
                transactionHash: response.txHash,
                ipId: response.ipId,
                ipMetadataUri: `https://ipfs.io/ipfs/${ipIpfsHash}`,
                nftMetadataUri: `https://ipfs.io/ipfs/${nftIpfsHash}`,
                explorerUrl: `https://explorer.story.foundation/ipa/${response.ipId}`,
                imageUrl: imageUrl,
                metadata: ipMetadata,
            }),
            { status: 200 },
        )
    } catch (error) {
        console.error('Error generating and minting NFT:', error)
        return new NextResponse(
            JSON.stringify({ error: 'Failed to generate and mint NFT' }),
            { status: 500 },
        )
    }
}
