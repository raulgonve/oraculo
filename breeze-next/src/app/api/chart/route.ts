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
            - Advanced Elements: Part of Fortune, Lilith (Black Moon), Ceres, Pallas, Juno, Vesta, Eris
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
            max_tokens: 2000,
        })

        const contentString = response.choices[0].message?.content?.trim() ?? ''
        console.log(contentString)
        // Buscar y extraer el contenido JSON que está entre {}
        const jsonMatch = contentString.match(/{[\s\S]*}/)
        if (!jsonMatch) {
            throw new Error('No JSON content found in the response')
        }

        // Obtener el JSON y eliminar comentarios y espacios innecesarios
        const cleanedContentString = jsonMatch[0]
            .replace(/\/\/.*$/gm, '') // Eliminar los comentarios que comienzan con //
            .trim() // Eliminar espacios en blanco al inicio y al final

        // const cleanedContentString = `{
        //         "astral": [
        //             {
        //                 "element_name": "Sun Sign",
        //                 "description": "Leo",
        //                 "element_type": "Astral",
        //                 "meaning": "As a Leo sun, you are naturally charismatic and confident. Leos are known for their warm-hearted, generous nature and strong desire to be in the spotlight. You have a creative spirit and are often seen as a natural leader among peers."
        //             },
        //             {
        //                 "element_name": "Moon",
        //                 "description": "Taurus",
        //                 "element_type": "Astral",
        //                 "meaning": "The moon in Taurus gives you a steady and dependable emotional nature. You crave comfort and stability in your personal life and often have a practical approach to handling emotions. You're likely to be attracted to beauty, both in your environment and in relationships, valuing loyalty and consistency."
        //             },
        //             {
        //                 "element_name": "Ascendant",
        //                 "description": "Sagittarius",
        //                 "element_type": "Astral",
        //                 "meaning": "With Sagittarius rising, you come across as energetic and enthusiastic. You have a natural curiosity and a love for adventure and exploration. People see you as open-minded and friendly, often seeking opportunities to expand your horizons through travel or philosophical pursuits."
        //             },
        //             {
        //                 "element_name": "Mercury",
        //                 "description": "Leo",
        //                 "element_type": "Astral",
        //                 "meaning": "Mercury in Leo suggests that you communicate with flair and charisma. Your ideas are often expressed dramatically, and you enjoy entertaining others with your stories and experiences. This position may also indicate a strong desire to lead in discussions or intellectual pursuits."
        //             },
        //             {
        //                 "element_name": "Venus",
        //                 "description": "Virgo",
        //                 "element_type": "Astral",
        //                 "meaning": "Venus in Virgo indicates a love for detail and precision in relationships. You may be drawn to partners who are reliable and pragmatic, and you express love through thoughtful gestures and acts of service."
        //             },
        //             {
        //                 "element_name": "Mars",
        //                 "description": "Cancer",
        //                 "element_type": "Astral",
        //                 "meaning": "Mars in Cancer suggests that your drive and energy are heavily influenced by your emotions. You approach challenges with sensitivity and care, often motivated by a desire to protect and nurture those you care about."
        //             },
        //             {
        //                 "element_name": "Jupiter",
        //                 "description": "Aquarius",
        //                 "element_type": "Astral",
        //                 "meaning": "Jupiter in Aquarius suggests a forward-thinking and humanitarian approach. It can indicate a person who values truth and fairness and has a strong desire to contribute to the community."
        //             },
        //             {
        //                 "element_name": "Saturn",
        //                 "description": "Scorpio",
        //                 "element_type": "Astral",
        //                 "meaning": "Saturn in Scorpio may indicate intensity and a desire for deep transformation through discipline. It can also denote a serious approach to matters of privacy and personal growth."
        //             },
        //             {
        //                 "element_name": "Uranus",
        //                 "description": "Sagittarius",
        //                 "element_type": "Astral",
        //                 "meaning": "Uranus in Sagittarius indicates a deep desire for freedom and an unconventional approach to philosophical and educational pursuits. You may have a strong urge to reform traditional belief systems."
        //             },
        //             {
        //                 "element_name": "Neptune",
        //                 "description": "Sagittarius",
        //                 "element_type": "Astral",
        //                 "meaning": "Neptune in Sagittarius suggests a visionary and idealistic nature concerning philosophical and spiritual matters. It can often lead to a quest for truth and meaning through mystical experiences."
        //             },
        //             {
        //                 "element_name": "Pluto",
        //                 "description": "Scorpio",
        //                 "element_type": "Astral",
        //                 "meaning": "Pluto in Scorpio signifies a generation with a deep focus on transformation and regeneration. It often brings about an intense drive for achieving power and influence."
        //             },
        //             {
        //                 "element_name": "North Node",
        //                 "description": "Taurus",
        //                 "element_type": "Astral",
        //                 "meaning": "North Node in Taurus suggests a life path centered around finding stability and building lasting security. This position encourages embracing simplicity, patience, and emotional resilience."
        //             }
        //         ],
        //         "advance": [
        //             {
        //                 "element_name": "Part of Fortune",
        //                 "description": "Scorpio",
        //                 "element_type": "Advanced",
        //                 "meaning": "The Part of Fortune in Scorpio indicates a person who finds true happiness by exploring deeper mysteries of life, embracing transformation, and harnessing hidden resources with courage."
        //             },
        //             {
        //                 "element_name": "Lilith (Black Moon)",
        //                 "description": "Cancer",
        //                 "element_type": "Advanced",
        //                 "meaning": "Lilith in Cancer suggests a deeply intuitive nature with rich emotions. It can indicate unresolved issues surrounding family and home or a quest for nurturing relationships with strong emotional bonds."
        //             },
        //             {
        //                 "element_name": "Ceres",
        //                 "description": "Libra",
        //                 "element_type": "Advanced",
        //                 "meaning": "Ceres in Libra indicates nurturing through partnership and harmony. This placement favors relationships where balance and beauty are highly valued in providing care for oneself and others."
        //             },
        //             {
        //                 "element_name": "Pallas",
        //                 "description": "Virgo",
        //                 "element_type": "Advanced",
        //                 "meaning": "Pallas in Virgo signifies strategic intelligence and skill applied through attention to detail and practicality. Problem-solving is approached with precision and efficiency."
        //             },
        //             {
        //                 "element_name": "Juno",
        //                 "description": "Libra",
        //                 "element_type": "Advanced",
        //                 "meaning": "Juno in Libra values partnership and equality. This placement often seeks commitment and harmony in relationships, emphasizing fairness, cooperation, and shared interests."
        //             },
        //             {
        //                 "element_name": "Vesta",
        //                 "description": "Leo",
        //                 "element_type": "Advanced",
        //                 "meaning": "Vesta in Leo denotes a dedication to self-expression and creative pursuits. There is a strong focus on maintaining personal integrity and contributing to the collective well-being through individual talents."
        //             },
        //             {
        //                 "element_name": "Eris",
        //                 "description": "Aries",
        //                 "element_type": "Advanced",
        //                 "meaning": "Eris in Aries represents a force of disruption for personal awakening. It encourages taking bold actions and embracing one's individuality amidst chaos, challenging the status quo for self-discovery."
        //             }
        //         ],
        //         "aspects": [
        //             {
        //                 "aspect": "Trine",
        //                 "involved_planets": ["Sun", "Moon"],
        //                 "aspect_type": "Trine",
        //                 "meaning": "A harmonious aspect between the sun and moon indicates a balanced personality where your conscious desires and emotional needs work well together. This brings a sense of inner harmony, making you self-assured and emotionally mature."
        //             },
        //             {
        //                 "aspect": "Square",
        //                 "involved_planets": ["Venus", "Neptune"],
        //                 "aspect_type": "Square",
        //                 "meaning": "This challenging aspect suggests potential confusion or idealism in relationships. You may need to be careful not to idealize partners or situations beyond reality, which can occasionally lead to disillusionment."
        //             },
        //             {
        //                 "aspect": "Sextile",
        //                 "involved_planets": ["Mars", "Uranus"],
        //                 "aspect_type": "Sextile",
        //                 "meaning": "This aspect provides a burst of innovative energy and a desire for freedom. You are likely to be spontaneous and open to new ways of doing things, often finding unique solutions to problems."
        //             }
        //         ]
        //     }`
        console.log(cleanedContentString)
        let content
        try {
            content = JSON.parse(cleanedContentString)
        } catch (error) {
            console.error('Failed to parse content as JSON:', error)
            throw new Error('Invalid JSON response from OpenAI')
        }

        return new NextResponse(
            JSON.stringify({
                message: 'Chart data obteined successfully',
                data: content,
            }),
            { status: 200 },
        )
    } catch (error) {
        console.error('Error processing chart data:', error)
        return new NextResponse('Error processing chart data', { status: 500 })
    }
}
