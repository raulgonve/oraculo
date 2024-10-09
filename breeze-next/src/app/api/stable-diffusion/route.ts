import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

const apiKey = process.env.HUGGING_FACE_API_KEY as string;
const modelURL = 'https://api-inference.huggingface.co/models/sd-legacy/stable-diffusion-v1-5';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const prompt = `Generate an image that describes the following: ${messages}`;

    // Request to the Stable Diffusion v1.5 model
    const response = await fetch(modelURL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,  // Your prompt
        options: {
          wait_for_model: true // Ensures the model waits if not immediately available
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Model request failed: ${response.statusText}`);
    }

    // Read the response as binary data (ArrayBuffer)
    const imageBuffer = await response.arrayBuffer();

    // Convert the binary data to base64 format
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Return the generated image in base64 format
    return NextResponse.json({
      image: base64Image,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
