import OpenAI from 'openai'

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you are using your API Key
})

// Get assistant and vector store IDs from environment variables
const assistantId = process.env.ASSISTANT_ID_CHATBOT
const vectorId = process.env.VECTOR_STORE_ID

// If the assistant ID is missing, throw an error
if (!assistantId) {
    throw new Error(
        'The ASSISTANT_ID is not defined in the environment variables',
    )
}

// POST request handler
export async function POST(req: Request): Promise<Response> {
    try {
        // Parse the request body to extract messages and userAstroData
        const { messages, userAstroData } = await req.json()

        // Append userAstroData to the messages array as user input
        messages.push({
            role: 'user',
            content: `Here is my personal data,
            Name: ${userAstroData.name},
            Date of Birth: ${userAstroData.birthDate},
            Time of Birth: ${userAstroData.birthTime},
            Place of Birth: ${userAstroData.birthPlace},
            Sun Sign: ${userAstroData.sun},
            Moon Sign: ${userAstroData.moon},
            Rising Sign: ${userAstroData.ascendant}.`,
        })

        // Update the assistant to use the vector store for file search if necessary
        await openai.beta.assistants.update(assistantId, {
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorId], // Use vector store to enhance responses
                },
            },
        })

        // Create a thread with the user's messages and previous conversations
        const thread = await openai.beta.threads.create({
            messages: messages,
        })

        // Create a readable stream to return response chunks as they are generated
        const stream = new ReadableStream({
            async start(controller) {
                openai.beta.threads.runs
                    .stream(thread.id, {
                        assistant_id: assistantId, // Use the assistant for the thread
                    })
                    .on('textDelta', textDelta => {
                        // For each text fragment (delta), encode it and add to stream
                        const chunk = textDelta.value
                        if (chunk) {
                            const htmlChunk = convertMarkdownToHtml(chunk) // Convert Markdown to HTML if needed
                            controller.enqueue(
                                new TextEncoder().encode(htmlChunk),
                            )
                        }
                    })
                    .on('messageDone', () => {
                        // Close the stream once the message is fully generated
                        controller.close()
                    })
                    .on('error', error => {
                        // Handle any errors that occur during streaming
                        console.error('Error during streaming:', error)
                        controller.error(error)
                    })
            },
        })

        // Return the response as an HTML stream with appropriate headers
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error) {
        // Log any errors that occur during the process
        console.error('Error generating response:', error)
        return new Response('Failed to generate response', { status: 500 })
    }
}

// Function to convert Markdown to HTML for easier display
function convertMarkdownToHtml(markdown: string): string {
    return markdown
        .replace(/^### (.*$)/gim, '<h4>$1</h4>') // Convert ### to <h4>
        .replace(/^## (.*$)/gim, '<h1>$1</h1>') // Convert ## to <h1>
        .replace(/^# (.*$)/gim, '<h2>$1</h2>') // Convert # to <h2>
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*)\*/gim, '<em>$1</em>') // Italic text
        .replace(/\n$/gim, '<br />') // Line breaks
}
