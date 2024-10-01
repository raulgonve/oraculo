import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

const openai = new OpenAI()

export const runtime = 'edge'

export async function POST(req: Request) {
    try {
        // Extraer el contenido del cuerpo de la solicitud
        const { messages } = await req.json()

        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error(
                "Invalid data format: 'messages' should be a non-empty array.",
            )
        }

        const userMessage = messages.find(message => message.role === 'user')
        if (!userMessage) {
            throw new Error('Invalid data format: No user message found.')
        }

        // Parsear el contenido JSON del mensaje
        let birthDetails
        try {
            birthDetails = JSON.parse(userMessage.content)
        } catch (parseError) {
            throw new Error(
                'Failed to parse birth details from user message content.',
            )
        }

        const { birthDate, birthTime, birthPlace } = birthDetails

        // Validar que los datos requeridos estén presentes
        if (!birthDate || !birthTime || !birthPlace) {
            throw new Error(
                'Invalid data format: birthDate, birthTime, and birthPlace are required.',
            )
        }

        console.log('Birth Date:', birthDate)
        console.log('Birth Time:', birthTime)
        console.log('Birth Place:', birthPlace)

        // Crear el prompt basado en la información astrológica
        const prompt = `
      Given the following birth details:
      - Date of Birth: ${birthDate}
      - Time of Birth: ${birthTime}
      - Place of Birth: ${birthPlace}

      Generate a detailed astrological chart including both basic and advanced aspects. The basic chart should include the user's sun, moon, and rising signs, and a brief description of their general personality traits. The advanced chart should describe planetary positions, houses, and aspects, including how these influence the person's strengths, weaknesses, relationships, and career. Use accessible language and explain the astrological terminology where necessary.`

        // Solicitar a OpenAI la generación de la carta astral
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: [
                {
                    role: 'system',
                    content: `You are a professional astrologer who provides detailed and insightful astrological charts for users. Use the provided birth details to create a comprehensive chart, covering both basic and advanced aspects.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        })

        // Utiliza OpenAIStream para procesar la respuesta
        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.error('Error generating astrological data:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred'
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 400,
        })
    }
}
