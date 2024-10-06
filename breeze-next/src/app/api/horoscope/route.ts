import OpenAI from 'openai'

// Inicializar OpenAI con la configuración adecuada
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de usar tu API Key
})

export async function POST(req: Request): Promise<Response> {
    try {
        // Obtener los datos enviados en la solicitud
        const userAstroData = await req.json()

        if (
            !userAstroData ||
            !userAstroData.birthDate ||
            !userAstroData.birthTime ||
            !userAstroData.birthPlace
        ) {
            return new Response('User data is incomplete', { status: 400 })
        }

        // Actualizar el asistente para utilizar el vector store
        await openai.beta.assistants.update('asst_a1TDl7rmQhlwWpqUJcr70c4b', {
            tool_resources: {
                file_search: {
                    vector_store_ids: ['vs_1plXPNgu5shPvvJrIX1nQ0JG'],
                },
            },
        })

        // Crear un nuevo hilo para iniciar una conversación con el asistente existente
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

        // Utilizar un stream para obtener la respuesta del asistente
        let horoscopeText = ''

        return new Promise<Response>((resolve, reject) => {
            openai.beta.threads.runs
                .stream(thread.id, {
                    assistant_id: 'asst_a1TDl7rmQhlwWpqUJcr70c4b',
                })
                .on('textCreated', () => console.log('assistant >'))
                .on('toolCallCreated', event =>
                    console.log('assistant ' + event.type),
                )
                .on('textDelta', textDelta => {
                    horoscopeText += textDelta.value
                })
                .on('messageDone', () => {
                    if (horoscopeText) {
                        resolve(
                            new Response(
                                JSON.stringify({ horoscope: horoscopeText }),
                                {
                                    status: 200,
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                },
                            ),
                        )
                    } else {
                        console.error('No valid content found in the response')
                        resolve(
                            new Response(
                                'No valid content found in the response',
                                { status: 400 },
                            ),
                        )
                    }
                })
                .on('error', error => {
                    console.error('Error during streaming:', error)
                    reject(
                        new Response('Failed to generate horoscope', {
                            status: 500,
                        }),
                    )
                })
        })
    } catch (error) {
        // Registrar el error si ocurre alguno durante el proceso
        console.error('Error generating horoscope:', error)
        return new Response('Failed to generate horoscope', { status: 500 })
    }
}
