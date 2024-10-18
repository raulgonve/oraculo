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
import { Livepeer } from '@livepeer/ai'
import { uploadJSONToIPFS } from '../../utils/uploadToIpfs'
import { createHash } from 'crypto'

export async function POST(req: Request) {
    try {
        // Recibe los prompts y los datos astrológicos del usuario
        const { prompts, userAstroData } = await req.json()

        // Inicializa Livepeer AI
        const livepeerAI = new Livepeer({
            httpBearer: '', // Usa tu token de autenticación si es necesario
        })

        // Generar las imágenes usando los diferentes prompts
        const [result1, result2, result3, result4] = await Promise.all([
            livepeerAI.generate.textToImage({
                prompt: prompts[0],
                modelId: 'SG161222/RealVisXL_V4.0',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
            livepeerAI.generate.textToImage({
                prompt: prompts[1],
                modelId: 'SG161222/RealVisXL_V4.0_Lightning',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
            livepeerAI.generate.textToImage({
                prompt: prompts[3],
                modelId: 'black-forest-labs/FLUX.1-schnell',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
            livepeerAI.generate.textToImage({
                prompt: prompts[2],
                modelId: 'ByteDance/SDXL-Lightning',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
        ])

        // Retorna las imágenes generadas
        return new NextResponse(
            JSON.stringify({
                images1: result1.imageResponse?.images,
                images2: result2.imageResponse?.images,
                images3: result3.imageResponse?.images,
                images4: result4.imageResponse?.images,
            }),
            {
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error generating image:', error)
        return new NextResponse(
            JSON.stringify({ error: 'Failed to generate image' }),
            { status: 500 },
        )
    }
}
// const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`
// const account: Account = privateKeyToAccount(privateKey)

// const rpcProvider = process.env.RPC_PROVIDER_URL

// if (!privateKey || !rpcProvider) {
//     return new NextResponse(
//         JSON.stringify({ error: 'Missing environment variables' }),
//         { status: 500 },
//     )
// }

// Initialize the account and StoryClient
// const config: StoryConfig = {
//     account: account,
//     transport: http(rpcProvider),
//     chainId: 'iliad',
// }

// const client = StoryClient.newClient(config)
// // Extract image details
// const imageUrl = result.imageResponse?.images[0]?.url || ''
// const isNsfw = result.imageResponse?.images[0]?.nsfw ? 'true' : 'false'

// // Create IP metadata with userAstroData and image attributes
// const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
//     title: `Astrological IP NFT: Personalized for ${userAstroData.name}`,
//     description: `Generated based on the user's astrological data. Sign: ${userAstroData.sun}, Ascendant: ${userAstroData.ascendant}, Moon: ${userAstroData.moon}`,
//     attributes: [
//         {
//             key: 'Sun Sign',
//             value: userAstroData.sun || 'Unknown',
//         },
//         {
//             key: 'Moon Sign',
//             value: userAstroData.moon || 'Unknown',
//         },
//         {
//             key: 'Ascendant',
//             value: userAstroData.ascendant || 'Unknown',
//         },
//         {
//             key: 'Date of Birth',
//             value: userAstroData.birthDate || 'Unknown',
//         },
//         {
//             key: 'Time of Birth',
//             value: userAstroData.birthTime || 'Unknown',
//         },
//         {
//             key: 'Place of Birth',
//             value: userAstroData.birthPlace || 'Unknown',
//         },
//         {
//             key: 'NSFW',
//             value: isNsfw, // Adding the NSFW status of the generated image
//         },
//         {
//             key: 'AI Generated',
//             value: 'true', // Indicating that the image is AI-generated
//         },
//         {
//             key: 'Image URL',
//             value: imageUrl, // URL of the generated image
//         },
//     ],
// })

// const nftMetadata = {
//     name: `IP Astrological NFT for ${userAstroData.name}`,
//     description: prompt,
//     image: imageUrl,
// }

// const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
// const ipHash = createHash('sha256')
//     .update(JSON.stringify(ipMetadata))
//     .digest('hex')
// const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
// const nftHash = createHash('sha256')
//     .update(JSON.stringify(nftMetadata))
//     .digest('hex')

// console.log(ipHash)
// console.log(ipIpfsHash)

// const response: CreateIpAssetWithPilTermsResponse =
//     await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
//         nftContract: process.env.NFT_CONTRACT_ADDRESS as Address,
//         pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
//         ipMetadata: {
//             ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
//             ipMetadataHash: `0x${ipHash}`,
//             nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
//             nftMetadataHash: `0x${nftHash}`,
//         },
//         txOptions: { waitForTransaction: true },
//     })

// console.log(
//     `Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`,
// )
// console.log(
//     `View on the explorer: https://explorer.story.foundation/ipa/${response.ipId}`,
// )
