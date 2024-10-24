import { NextResponse } from 'next/server'
import { Livepeer } from '@livepeer/ai'

export async function POST(req: Request) {
    try {
        // Receive the prompts and user's astrological data from the request body
        const { prompts, userAstroData } = await req.json()

        // Initialize Livepeer AI with an authentication token if needed
        const livepeerAI = new Livepeer({
            httpBearer: '', // Add your Livepeer authentication token here
        })

        // Generate images using the different prompts simultaneously
        const [result1, result2, result3, result4] = await Promise.all([
            livepeerAI.generate.textToImage({
                prompt: prompts[0], // First prompt
                modelId: 'SG161222/RealVisXL_V4.0', // Model ID used for image generation
                width: 1024, // Image width
                height: 1024, // Image height
                // Negative prompt to avoid undesired features
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
            livepeerAI.generate.textToImage({
                prompt: prompts[1], // Second prompt
                modelId: 'SG161222/RealVisXL_V4.0_Lightning',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
            livepeerAI.generate.textToImage({
                prompt: prompts[3], // Third prompt (note, the third prompt is accessed with index 3, so prompts[3])
                modelId: 'black-forest-labs/FLUX.1-schnell',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
            livepeerAI.generate.textToImage({
                prompt: prompts[2], // Fourth prompt (index 2)
                modelId: 'ByteDance/SDXL-Lightning',
                width: 1024,
                height: 1024,
                negative_prompt:
                    'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
            }),
        ])

        // Return the generated images in the response
        return new NextResponse(
            JSON.stringify({
                images1: result1.imageResponse?.images, // Images from the first prompt
                images2: result2.imageResponse?.images, // Images from the second prompt
                images3: result3.imageResponse?.images, // Images from the third prompt
                images4: result4.imageResponse?.images, // Images from the fourth prompt
            }),
            {
                status: 200, // Status code for success
            },
        )
    } catch (error) {
        // Log and return an error response if something goes wrong
        console.error('Error generating image:', error)
        return new NextResponse(
            JSON.stringify({ error: 'Failed to generate image' }), // Error message
            { status: 500 }, // Status code for server error
        )
    }
}
