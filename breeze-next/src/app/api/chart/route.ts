import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI with the provided API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge' // Define the runtime as 'edge' for better performance in edge environments

export async function POST(req) {
    try {
        // Parse the request body to extract the necessary data
        const {
            user_name,
            birth_date,
            birth_time,
            birth_place,
            astrological_chart,
            audio_summary,
        } = await req.json()

        // Convert the astrological chart into text format
        const chartText = astrological_chart
            .map(item => item.content) // Extract content from each chart element
            .join('\n') // Combine the chart elements into a single string

        // Generate the prompt for OpenAI with the birth details and astrological chart text
        const prompt = `
            You are an astrology expert. Given the following astrological chart text, extract the data as "Element" or "Aspect".
            For each astral, provide the name, description (value of the astral element), type (Astral), and an interpretation of the meaning.
            For each advance, provide the name, description (value of the advanced element), type (Advanced), and an interpretation of the meaning.
            For each aspect, provide the name, provide the aspect type (how the planets influence each other), involved planets(as an array of planets), and an interpretation of the meaning.
            If any main aspect, astral element, or advanced element is missing, calculate or get it using the existing data (birth date: ${birth_date}, time of birth: ${birth_time}, and birth place: ${birth_place}).

            The data required are:

            - Astral Elements: Sun Sign, Ascendent, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, Chiron
            - Advanced Elements: Part of Fortune, Lilith (Black Moon), Ceres, Pallas, Juno, Vesta, Eris, 1st House, 2nd House, 3rd House, 4th House, 5th House, 6th House, 7th House, 8th House, 9th House, 10th House, 11th House, 12th House
            - Aspects: Conjunction, Trine, Opposition, Square, Quintile

            Provide the result in the following JSON format:
            - astral: { element_name, description, element_type, meaning }
            - advance: { element_name, description, element_type, meaning }
            - aspects: { aspect, involved_planets, aspect_type, meaning }

            Astrological Chart Text:
            ${chartText}

            Extract the required information and provide an analysis for each element and aspect.
        `

        // Send the prompt to OpenAI to generate the astrological interpretation
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Specify the GPT model to use
            messages: [
                { role: 'system', content: 'You are an astrology expert.' }, // Set the system's role as an astrologer
                { role: 'user', content: prompt }, // Include the generated prompt
            ],
            max_tokens: 4000, // Set the token limit for the response
        })

        // Extract the content from the OpenAI response
        const contentString = response.choices[0].message?.content?.trim() ?? ''
        console.log(contentString)

        // Use regular expressions to find the JSON block within the OpenAI response
        const jsonBlocks = contentString.match(/```json([\s\S]*?)```/g)

        if (!jsonBlocks || jsonBlocks.length === 0) {
            throw new Error('No JSON content found in the response') // Throw error if no JSON block is found
        }

        // Clean the extracted JSON block by removing the markdown syntax
        const jsonString = jsonBlocks[0]
            .replace(/```json/g, '') // Remove the ```json delimiter
            .replace(/```/g, '') // Remove the closing ```
            .trim() // Remove extra spaces

        console.log(jsonString)

        let content
        try {
            // Parse the cleaned JSON string into a JavaScript object
            content = JSON.parse(jsonString)
        } catch (error) {
            console.error('Failed to parse content as JSON:', error)
            throw new Error('Invalid JSON response from OpenAI') // Throw error if parsing fails
        }

        // Return the parsed content as a JSON response with status 200
        return new NextResponse(
            JSON.stringify({
                message: 'Chart data obtained successfully',
                data: content,
            }),
            { status: 200 },
        )
    } catch (error) {
        // Log any errors and return an error response with status 500
        console.error('Error processing chart data:', error)
        return new NextResponse('Error processing chart data', { status: 500 })
    }
}
