import { NextResponse } from 'next/server'
import { Livepeer } from '@livepeer/ai'

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
