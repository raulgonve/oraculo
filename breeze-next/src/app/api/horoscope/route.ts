import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req) {
    try {
        // Obtener los datos enviados en la solicitud
        const userAstroData = await req.json()

        if (!userAstroData) {
            return new NextResponse('User data is required', { status: 400 })
        }

        // Paso 1: Crear un hilo (thread) para generar la respuesta usando el asistente existente
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: 'user',
                    content: `Please generate a daily horoscope for the following details: 
                    Date of Birth: ${userAstroData.birthDate}, 
                    Time of Birth: ${userAstroData.birthTime}, 
                    Place of Birth: ${userAstroData.birthPlace}, 
                    Sun Sign: ${userAstroData.sun}, 
                    Moon Sign: ${userAstroData.moon}, 
                    Rising Sign: ${userAstroData.ascendant}.`,
                },
            ],
        })

        console.log('Thread Created:', thread)

        // Verificar si el hilo se creó correctamente
        if (!thread || !thread.id) {
            throw new Error('Failed to create thread.')
        }

        // Esperar brevemente para asegurarnos de que el Thread esté disponible
        await new Promise(resolve => setTimeout(resolve, 5000)) // Esperar 5 segundos

        // Paso 2: Crear un "Run" para ejecutar la solicitud usando el `assistant_id` proporcionado
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: 'asst_a1TDl7rmQhlwWpqUJcr70c4b',
        })

        console.log('Run Created:', run)

        // Verificar si el run se creó correctamente
        if (!run || !run.id) {
            throw new Error('Failed to create run.')
        }

        // Paso 3: Esperar a que el "Run" esté completado y verificar el resultado
        let runStatus = run.status
        let maxRetries = 15
        let retryCount = 0

        while (
            runStatus !== 'completed' &&
            runStatus !== 'failed' &&
            retryCount < maxRetries
        ) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Esperar 2 segundos antes de consultar nuevamente
            const updatedRun = await openai.beta.threads.runs.retrieve(run.id)
            runStatus = updatedRun.status
            retryCount++

            console.log(
                `Polling Run Status [Attempt ${retryCount}]: ${runStatus}`,
            )
        }

        if (runStatus === 'failed') {
            throw new Error(
                'El proceso del asistente falló al generar el horóscopo.',
            )
        }

        if (runStatus !== 'completed') {
            throw new Error('El proceso del asistente no se completó a tiempo.')
        }

        // Paso 4: Obtener el resultado del run completado
        const result = await openai.beta.threads.runs.result(run.id)

        if (!result || !result.content) {
            throw new Error(
                'No se encontró contenido en la respuesta del asistente.',
            )
        }

        // Devolver la respuesta del horóscopo
        return NextResponse.json({ horoscope: result.content })
    } catch (error) {
        console.error('Failed to generate horoscope:', error)
        return new NextResponse('Failed to generate horoscope', { status: 500 })
    }
}
