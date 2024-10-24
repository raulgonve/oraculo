import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

const openai = new OpenAI()

export const runtime = 'edge'

export async function POST(req: Request) {
    try {
        // Extract the content from the request body
        const { messages } = await req.json()

        // Validate that 'messages' is an array and is not empty
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error(
                "Invalid data format: 'messages' should be a non-empty array.",
            )
        }

        // Find the message from the user in the 'messages' array
        const userMessage = messages.find(message => message.role === 'user')
        if (!userMessage) {
            throw new Error('Invalid data format: No user message found.')
        }

        // Try to parse the user's message content (expected to contain birth details)
        let birthDetails
        try {
            birthDetails = JSON.parse(userMessage.content)
        } catch (parseError) {
            throw new Error(
                'Failed to parse birth details from user message content.',
            )
        }

        const { birthDate, birthTime, birthPlace } = birthDetails

        // Validate that birthDate, birthTime, and birthPlace are provided
        if (!birthDate || !birthTime || !birthPlace) {
            throw new Error(
                'Invalid data format: birthDate, birthTime, and birthPlace are required.',
            )
        }

        // Log the birth details for debugging purposes
        console.log('Birth Date:', birthDate) // Format: YYYY-MM-DD
        console.log('Birth Time:', birthTime) // Format: HH:MM AM/PM
        console.log('Birth Place:', birthPlace)

        // Create the prompt based on the birth details to generate the astrological chart
        const prompt = `
      Given the following birth details:
      - Date of Birth: ${birthDate}
      - Time of Birth: ${birthTime}
      - Place of Birth: ${birthPlace}

      Generate a detailed astrological chart including both basic and advanced aspects. The basic chart should include the user's sun, moon, and rising signs, and a brief description of their general personality traits. The advanced chart should describe planetary positions, houses, and aspects, including how these influence the person's strengths, weaknesses, relationships, and career. Use accessible language and explain the astrological terminology where necessary.`

        // Request OpenAI to generate the astrological chart
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Using the GPT-4 model
            stream: true, // Enable streaming for real-time responses
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

        // Use OpenAIStream to process and stream the response
        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream) // Return the streamed response
    } catch (error) {
        // Handle and log any errors during the process
        console.error('Error generating astrological data:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred'
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 400, // Return error status 400 if something goes wrong
        })
    }
}
