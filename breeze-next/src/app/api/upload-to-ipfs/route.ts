import { NextResponse } from 'next/server'
import { uploadJSONToIPFS } from '../../utils/uploadToIpfs'

export async function POST(req) {
    try {
        // Extract data from the request body
        const {
            contractName,
            contractDescription,
            contractImageUrl,
            contractVideoUrl,
        } = await req.json()

        // Create the contract metadata to upload to IPFS
        const contractJSON = {
            name: contractName,
            description: contractDescription,
            image: contractImageUrl,
        }

        // Create the token metadata to upload to IPFS
        const tokenJSON = {
            name: `Token NFT for ${contractName}`,
            description: `Token NFT for ${contractName}`,
            image: contractImageUrl,
            animation_url: contractVideoUrl, // URL for the video (animation)
            content: {
                mime: 'video/mp4',
                uri: contractVideoUrl, // Video file URI
            },
            attributes: {
                trait_type: 'Contract', // Define the type of attribute
                value: contractName, // Value of the trait (contract name)
            },
            thumbnailUrl: contractImageUrl, // Thumbnail for the token (image URL)
            mediaUrl: contractVideoUrl, // Media URL for the video content
        }

        // Upload the contract and token metadata to IPFS
        const contractMetadataHash = await uploadJSONToIPFS(contractJSON)
        const tokenMetadataHash = await uploadJSONToIPFS(tokenJSON)

        // Return the uploaded metadata hashes as a response
        return new NextResponse(
            JSON.stringify({
                contractMetadataUri: `https://ipfs.io/ipfs/${contractMetadataHash}`, // IPFS URI for contract metadata
                tokenMetadataUri: `https://ipfs.io/ipfs/${tokenMetadataHash}`, // IPFS URI for token metadata
            }),
            { status: 200 }, // HTTP status code for success
        )
    } catch (error) {
        // Handle errors and return a 500 status response if something goes wrong
        console.error('Error uploading to IPFS:', error)
        return new NextResponse(
            JSON.stringify({ error: 'Failed to upload metadata to IPFS' }), // Error message
            { status: 500 }, // HTTP status code for server error
        )
    }
}
