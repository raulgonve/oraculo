import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize the OpenAI instance with the API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set
})

export const runtime = 'edge' // Define the runtime environment for the function as 'edge'

export async function POST(req: Request) {
    try {
        // Parse the incoming request body to get the 'message'
        const { message } = await req.json()

        // Use OpenAI to generate a summary for the provided message
        const summaryResponse = await openai.chat.completions.create({
            model: 'gpt-4o', // Specify the OpenAI model to use (e.g., GPT-4)
            messages: [
                {
                    role: 'user',
                    content: `Please provide a concise summary with key conclusions for the following message:\n${message}`, // Prompt to generate a summary
                },
            ],
        })

        // Extract the generated summary from the response
        const summary = summaryResponse.choices[0].message.content

        // Use OpenAI to generate speech/audio from the summary
        const response = await openai.audio.speech.create({
            model: 'tts-1', // Text-to-speech model identifier
            voice: 'alloy', // Voice type for speech synthesis
            input: summary, // The summary text to be converted into speech
        })

        // Return the generated audio as the response
        return new NextResponse(response.body)
    } catch (error) {
        // Log any errors that occur and return an error response
        console.error('Error generating audio:', error)
        return new NextResponse('Error generating audio', { status: 500 })
    }
}
