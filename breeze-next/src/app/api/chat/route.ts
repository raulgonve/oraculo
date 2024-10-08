import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de usar tu API Key
});
const assistantId = process.env.ASSISTANT_ID_CHATBOT;
const vectorId = process.env.VECTOR_STORE_ID;

if (!assistantId) {
    throw new Error('The ASSISTANT_ID is not defined in the environment variables');
}

export async function POST(req: Request): Promise<Response> {
    try {
        // Obtener los datos enviados en la solicitud
        const { messages } = await req.json(); // Extraer el array de mensajes desde el cuerpo de la solicitud

        // Actualizar el asistente para utilizar el vector store (si es necesario)
        await openai.beta.assistants.update(assistantId, {
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorId],
                },
            },
        });

        // Crear el thread con todos los mensajes del usuario y la IA
        const thread = await openai.beta.threads.create({
            messages: messages, // Pasar los mensajes anteriores más el nuevo del usuario
        });

        // Crear un stream para enviar la respuesta al cliente a medida que se genera
        const stream = new ReadableStream({
            async start(controller) {
                openai.beta.threads.runs
                    .stream(thread.id, {
                        assistant_id: assistantId,
                    })
                    .on('textDelta', (textDelta) => {
                        // Escribir cada fragmento de texto en el stream
                        const chunk = textDelta.value;
                        if (chunk) {
                            // Convertir el Markdown a HTML si es necesario
                            const htmlChunk = convertMarkdownToHtml(chunk);
                            controller.enqueue(new TextEncoder().encode(htmlChunk));
                        }
                    })
                    .on('messageDone', () => {
                        // Cerrar el stream cuando el mensaje esté completo
                        controller.close();
                    })
                    .on('error', (error) => {
                        console.error('Error during streaming:', error);
                        controller.error(error);
                    });
            },
        });

        // Devolver la respuesta como un streaming
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        // Registrar el error si ocurre alguno durante el proceso
        console.error('Error generating response:', error);
        return new Response('Failed to generate response', { status: 500 });
    }
}

// Función para convertir Markdown a HTML
function convertMarkdownToHtml(markdown: string): string {
    // Ejemplo simple de conversión de Markdown a HTML
    return markdown
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^## (.*$)/gim, '<h1>$1</h1>')
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n$/gim, '<br />');
}
