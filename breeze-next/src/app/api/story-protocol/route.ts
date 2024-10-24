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
        // Receive the image URL, user's astrological data, and prompt from the request body
        const { imageUrl, userAstroData, prompt } = await req.json()

        // Set the user's private key and create an account using viem library
        const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`
        const account: Account = privateKeyToAccount(privateKey)

        // Set up the RPC provider for blockchain interactions
        const rpcProvider = process.env.RPC_PROVIDER_URL

        if (!privateKey || !rpcProvider) {
            // Return error if environment variables are missing
            return new NextResponse(
                JSON.stringify({ error: 'Missing environment variables' }),
                { status: 500 },
            )
        }

        // Initialize the StoryClient using the StoryConfig object
        const config: StoryConfig = {
            account: account,
            transport: http(rpcProvider),
            chainId: 'iliad', // Specify the chain ID for the blockchain
        }

        const client = StoryClient.newClient(config) // Initialize the client
        const isNsfw = 'false' // Specify if the content is NSFW (in this case, it is not)

        // Create the IP metadata (intellectual property metadata) for the NFT
        const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
            title: `Astrological IP NFT: Personalized for ${userAstroData.name}`, // Set the title for the NFT
            description: `Generated based on the user's astrological data. Sign: ${userAstroData.sun}, Ascendant: ${userAstroData.ascendant}, Moon: ${userAstroData.moon}`, // Description for the NFT
            attributes: [
                { key: 'Sun Sign', value: userAstroData.sun || 'Unknown' }, // Sun Sign
                { key: 'Moon Sign', value: userAstroData.moon || 'Unknown' }, // Moon Sign
                {
                    key: 'Ascendant',
                    value: userAstroData.ascendant || 'Unknown',
                }, // Ascendant
                {
                    key: 'Date of Birth',
                    value: userAstroData.birthDate || 'Unknown',
                }, // Date of Birth
                {
                    key: 'Time of Birth',
                    value: userAstroData.birthTime || 'Unknown',
                }, // Time of Birth
                {
                    key: 'Place of Birth',
                    value: userAstroData.birthPlace || 'Unknown',
                }, // Place of Birth
                { key: 'NSFW', value: isNsfw }, // Indicate whether the content is NSFW
                { key: 'AI Generated', value: 'true' }, // Indicate that the content is AI-generated
                { key: 'Image URL', value: imageUrl }, // URL of the generated image
            ],
        })

        // Create the NFT metadata (for the actual NFT)
        const nftMetadata = {
            name: `IP Astrological NFT for ${userAstroData.name}`, // Name of the NFT
            description: prompt || 'Astrological NFT', // Description of the NFT
            image: imageUrl, // URL of the image to be associated with the NFT
        }

        // Upload the IP metadata to IPFS (InterPlanetary File System) for decentralized storage
        const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
        const ipHash = createHash('sha256') // Create a hash for the metadata
            .update(JSON.stringify(ipMetadata))
            .digest('hex')

        // Upload the NFT metadata to IPFS and create a hash
        const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
        const nftHash = createHash('sha256')
            .update(JSON.stringify(nftMetadata))
            .digest('hex')

        // Mint and register the IP asset on the blockchain using Story Protocol
        const response: CreateIpAssetWithPilTermsResponse =
            await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
                nftContract: process.env.NFT_CONTRACT_ADDRESS as Address, // Smart contract address
                pilType: PIL_TYPE.NON_COMMERCIAL_REMIX, // Specify the PIL type (intellectual property terms)
                ipMetadata: {
                    ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`, // IPFS link to IP metadata
                    ipMetadataHash: `0x${ipHash}`, // Hash of the IP metadata
                    nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`, // IPFS link to NFT metadata
                    nftMetadataHash: `0x${nftHash}`, // Hash of the NFT metadata
                },
                txOptions: { waitForTransaction: true }, // Wait for the transaction to be confirmed on the blockchain
            })

        // Return the NFT details in the response
        return new NextResponse(
            JSON.stringify({
                transactionHash: response.txHash, // Transaction hash of the minting
                ipId: response.ipId, // IP ID of the minted asset
                ipMetadataUri: `https://ipfs.io/ipfs/${ipIpfsHash}`, // IPFS link to the IP metadata
                nftMetadataUri: `https://ipfs.io/ipfs/${nftIpfsHash}`, // IPFS link to the NFT metadata
                explorerUrl: `https://explorer.story.foundation/ipa/${response.ipId}`, // Explorer link to view the IP asset
                imageUrl: imageUrl, // Image URL
                metadata: ipMetadata, // Metadata for the IP asset
            }),
            { status: 200 }, // Success status
        )
    } catch (error) {
        // Handle and return an error if the process fails
        console.error('Error generating and minting NFT:', error)
        return new NextResponse(
            JSON.stringify({ error: 'Failed to generate and mint NFT' }), // Error message
            { status: 500 }, // Status code for server error
        )
    }
}
