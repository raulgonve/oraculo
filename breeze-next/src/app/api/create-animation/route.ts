import { Livepeer } from '@livepeer/ai'
import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import pinataSDK from '@pinata/sdk'

// Función para subir un archivo a Pinata
async function uploadVideoToPinata(videoPath: string) {
    const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })

    const readableStreamForFile = fs.createReadStream(videoPath)

    const options = {
        pinataMetadata: {
            name: 'Generated Video',
        },
        pinataOptions: {
            cidVersion: 0,
        },
    }

    try {
        const result = await pinata.pinFileToIPFS(
            readableStreamForFile,
            options,
        )
        return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    } catch (error) {
        console.error('Error uploading to Pinata:', error)
        throw new Error('Failed to upload video to IPFS')
    }
}

export async function POST(req: Request) {
    try {
        const { sunSign } = await req.json()

        // Prompt personalizado basado en el signo solar
        const prompt = `A powerful and majestic representation of the ${sunSign} zodiac sign radiating power and creativity. Colors of the universe swirl around, set against a breathtaking landscape of swirling nebulas, vibrant planets, and distant galaxies.`

        // Inicializa Livepeer AI usando el token del archivo .env
        const livepeerAI = new Livepeer({
            httpBearer: process.env.LIVEPEER_TOKEN, // Usamos el token desde el .env
        })

        // Generar la imagen usando el prompt
        const result = await livepeerAI.generate.textToImage({
            prompt,
            modelId: 'SG161222/RealVisXL_V4.0',
            width: 1024,
            height: 1024,
            negative_prompt:
                'low quality, low-resolution, unclear edges, duplicates, blurry faces, distorted faces, missing arms, distorted arms, incomplete arms, missing hands, distorted hands, incomplete hands, missing legs, distorted legs, incomplete legs, poorly drawn anatomy, unnatural body proportions',
        })

        const imageUrl = result.imageResponse?.images?.[0]?.url

        if (!imageUrl) {
            throw new Error('Image generation failed.')
        }

        console.log('Generated Image URL:', imageUrl)

        // Descargar la imagen generada
        const response = await fetch(imageUrl)
        if (!response.ok) {
            throw new Error('Failed to download generated image.')
        }

        const imagePath = path.join('/tmp', 'generated_image.png')
        const imageStream = fs.createWriteStream(imagePath)
        await new Promise((resolve, reject) => {
            response.body.pipe(imageStream)
            response.body.on('error', reject)
            imageStream.on('finish', resolve)
        })

        // Crear FormData para enviar la imagen a la API de Livepeer para generar el video
        const formData = new FormData()
        formData.append(
            'model_id',
            'stabilityai/stable-video-diffusion-img2vid-xt-1-1',
        ) // Modelo usado para la generación de video
        formData.append('image', fs.createReadStream(imagePath)) // Imagen descargada
        formData.append('width', '1024') // Especificar el ancho del video
        formData.append('height', '1024') // Especificar el alto del video

        const videoResponse = await fetch(
            'https://dream-gateway.livepeer.cloud/image-to-video',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.LIVEPEER_TOKEN}`, // Usamos el token desde el .env
                },
                body: formData,
            },
        )

        if (!videoResponse.ok) {
            throw new Error('Video generation failed.')
        }

        const videoData = await videoResponse.json()
        const videoUrl = videoData.images?.[0]?.url

        if (!videoUrl) {
            throw new Error('Failed to get video URL from response.')
        }

        console.log('Generated Video URL:', videoUrl)

        // Descargar el video generado
        const videoDownloadResponse = await fetch(videoUrl)
        if (!videoDownloadResponse.ok) {
            throw new Error('Failed to download generated video.')
        }

        const videoPath = path.join('/tmp', 'generated_video.mp4')
        const videoStream = fs.createWriteStream(videoPath)
        await new Promise((resolve, reject) => {
            videoDownloadResponse.body.pipe(videoStream)
            videoDownloadResponse.body.on('error', reject)
            videoStream.on('finish', resolve)
        })

        // Subir el video a Pinata (IPFS)
        const ipfsVideoUrl = await uploadVideoToPinata(videoPath)

        console.log('IPFS Video URL:', ipfsVideoUrl)

        // Retornar la URL del video subido a Pinata (IPFS)
        return new NextResponse(
            JSON.stringify({
                imageUrl, // URL de la imagen generada
                videoUrl, // URL del video generado
                ipfsVideoUrl, // URL del video en IPFS
            }),
            { status: 200 },
        )
    } catch (error) {
        console.error(
            'Error generating animation and uploading to IPFS:',
            error,
        )
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to generate animation and upload to IPFS',
            }),
            { status: 500 },
        )
    }
}
