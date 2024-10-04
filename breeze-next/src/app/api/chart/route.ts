import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req) {
    try {
        const {
            user_name,
            birth_date,
            birth_time,
            birth_place,
            astrological_chart,
            audio_summary,
        } = await req.json()

        // Convertir la carta astral a texto para usar en el prompt
        const chartText = astrological_chart
            .map(item => item.content)
            .join('\n')

        // Generar el prompt para extraer la información de la carta astral
        const prompt = `
            You are an astrology expert. Given the following astrological chart text, extract the data as "Element" or "Aspect".
            For each astral, provide the name, description (value of the astral element), type (Astral), and an interpretation of the meaning.
            For each advance, provide the name, description (value of the advanced element), type (Advanced), and an interpretation of the meaning.
            For each aspect, provide the name, provide the aspect type (how the planets influence each other), involved planets(as an array of planets), and an interpretation of the meaning.
            If any main aspect, astral element, or advanced element is missing, calculate or get it using the existing data (birth date: ${birth_date}, time of birth: ${birth_time} and birth place: ${birth_place}).

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

        // Llamada a OpenAI para procesar el prompt
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are an astrology expert.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 4000,
        })

        const contentString = response.choices[0].message?.content?.trim() ?? ''
        console.log(contentString)

        // Buscar y extraer el contenido JSON que está entre ```json y ```
        const jsonBlocks = contentString.match(/```json([\s\S]*?)```/g)

        if (!jsonBlocks || jsonBlocks.length === 0) {
            throw new Error('No JSON content found in the response')
        }

        // Extraer el primer bloque de JSON encontrado y limpiar el contenido
        const jsonString = jsonBlocks[0]
            .replace(/```json/g, '') // Eliminar el delimitador de inicio ```json
            .replace(/```/g, '') // Eliminar el delimitador de final ```
            .trim() // Eliminar espacios en blanco al inicio y al final

        console.log(jsonString)

        let content
        try {
            content = JSON.parse(jsonString)
        } catch (error) {
            console.error('Failed to parse content as JSON:', error)
            throw new Error('Invalid JSON response from OpenAI')
        }

        return new NextResponse(
            JSON.stringify({
                message: 'Chart data obtained successfully',
                data: content,
            }),
            { status: 200 },
        )
    } catch (error) {
        console.error('Error processing chart data:', error)
        return new NextResponse('Error processing chart data', { status: 500 })
    }
}
