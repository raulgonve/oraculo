import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de usar tu API Key
})
const assistantId = process.env.ASSISTANT_ID
const vectorId = process.env.VECTOR_STORE_ID

if (!assistantId) {
    throw new Error('The ASSISTANT is not defined in the environment variables')
}

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
        await openai.beta.assistants.update(assistantId, {
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorId],
                },
            },
        })

        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: 'user',
                    content: `Hello ${userAstroData.name}, here is your personalized daily horoscope based on the following details:
            Date of Birth: ${userAstroData.birthDate}, 
            Time of Birth: ${userAstroData.birthTime}, 
            Place of Birth: ${userAstroData.birthPlace}, 
            Sun Sign: ${userAstroData.sun}, 
            Moon Sign: ${userAstroData.moon}, 
            Rising Sign: ${userAstroData.ascendant}.`,
                },
            ],
        })
        // Crear un stream para enviar la respuesta al cliente a medida que se genera
        const stream = new ReadableStream({
            async start(controller) {
                openai.beta.threads.runs
                    .stream(thread.id, {
                        assistant_id: assistantId,
                    })
                    .on('textDelta', textDelta => {
                        // Escribir cada fragmento de texto en el stream
                        const chunk = textDelta.value
                        if (chunk) {
                            // Convertir el Markdown a HTML aquí si es necesario
                            const htmlChunk = convertMarkdownToHtml(chunk)
                            controller.enqueue(
                                new TextEncoder().encode(htmlChunk),
                            )
                        }
                    })
                    .on('messageDone', () => {
                        // Cerrar el stream cuando el mensaje esté completo
                        controller.close()
                    })
                    .on('error', error => {
                        console.error('Error during streaming:', error)
                        controller.error(error)
                    })
            },
        })

        // Devolver la respuesta como un streaming
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error) {
        // Registrar el error si ocurre alguno durante el proceso
        console.error('Error generating horoscope:', error)
        return new Response('Failed to generate horoscope', { status: 500 })
    }
}

// Función para convertir Markdown a HTML
function convertMarkdownToHtml(markdown: string): string {
    // Ejemplo simple de conversión de Markdown a HTML
    return markdown
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^## (.*$)/gim, '<h1>$1</h1>')
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n$/gim, '<br />')
}
