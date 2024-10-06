import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request) {
    try {
        const { message } = await req.json()

        // Generate a summary of the message
        const summaryResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: `Please provide a concise summary with key conclusions for the following message:\n${message}`,
                },
            ],
        })

        const summary = summaryResponse.choices[0].message.content

        // Generate audio from the summary
        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: summary,
        })

        return new NextResponse(response.body)
    } catch (error) {
        console.error('Error generating audio:', error)
        return new NextResponse('Error generating audio', { status: 500 })
    }
}
