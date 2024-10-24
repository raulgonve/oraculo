import OpenAI from 'openai'

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure to use your API Key
})

// Get the assistant ID and vector store ID from environment variables
const assistantId = process.env.ASSISTANT_ID
const vectorId = process.env.VECTOR_STORE_ID

// Throw an error if the assistant ID is not set
if (!assistantId) {
    throw new Error('The ASSISTANT is not defined in the environment variables')
}

export async function POST(req: Request): Promise<Response> {
    try {
        // Extract the user's astrological data from the request body
        const userAstroData = await req.json()

        // Validate that the necessary data is provided
        if (
            !userAstroData ||
            !userAstroData.birthDate ||
            !userAstroData.birthTime ||
            !userAstroData.birthPlace
        ) {
            return new Response('User data is incomplete', { status: 400 })
        }

        // Update the assistant to use the vector store for enhanced responses
        await openai.beta.assistants.update(assistantId, {
            tool_resources: {
                file_search: {
                    vector_store_ids: [vectorId], // Specify the vector store ID
                },
            },
        })

        // Create a thread with the user's message containing their astrological data
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

        // Create a stream to send the response to the client as it is generated
        const stream = new ReadableStream({
            async start(controller) {
                openai.beta.threads.runs
                    .stream(thread.id, {
                        assistant_id: assistantId, // Use the assistant ID for the thread
                    })
                    .on('textDelta', textDelta => {
                        // Process each text chunk as it is generated
                        const chunk = textDelta.value
                        if (chunk) {
                            // Convert Markdown to HTML if necessary
                            const htmlChunk = convertMarkdownToHtml(chunk)
                            controller.enqueue(
                                new TextEncoder().encode(htmlChunk),
                            )
                        }
                    })
                    .on('messageDone', () => {
                        // Close the stream when the message is fully generated
                        controller.close()
                    })
                    .on('error', error => {
                        // Handle any errors that occur during the streaming
                        console.error('Error during streaming:', error)
                        controller.error(error)
                    })
            },
        })

        // Return the response as an HTML stream
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache', // Ensure the response isn't cached
            },
        })
    } catch (error) {
        // Log any errors and return an error response
        console.error('Error generating horoscope:', error)
        return new Response('Failed to generate horoscope', { status: 500 })
    }
}

// Function to convert Markdown to HTML
function convertMarkdownToHtml(markdown: string): string {
    // Basic Markdown to HTML conversion
    return markdown
        .replace(/^### (.*$)/gim, '<h4>$1</h4>') // Convert ### to <h4>
        .replace(/^## (.*$)/gim, '<h1>$1</h1>') // Convert ## to <h1>
        .replace(/^# (.*$)/gim, '<h2>$1</h2>') // Convert # to <h2>
        .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*)\*/gim, '<em>$1</em>') // Italic text
        .replace(/\n$/gim, '<br />') // Line breaks
}
