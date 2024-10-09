import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

const apiKey = process.env.HUGGING_FACE_API_KEY as string;
const modelURL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // remove html tags from message
    const regex = /(<([^>]+)>)/ig;
    let cleanMessage = message.replace(regex, '');

    // takes the fist 400 characters of the message
    cleanMessage = cleanMessage.substring(0, Math.min(cleanMessage.length, 800));

    const prompt = `Generate an image that describes the following: ${cleanMessage}`;

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
          wait_for_model: true, // Ensures the model waits if not immediately available
          guidance_scale: 2, // Adjust the guidance scale as needed
          negative_prompt: 'A dark and gloomy day', // Negative prompt to guide the model
          num_inference_steps: 50, // Number of inference steps
          target_size:{
            width: 512,
            height: 512,
          }
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
    return NextResponse.json(base64Image);
  } catch (error) {
    console.error('Error generating image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
