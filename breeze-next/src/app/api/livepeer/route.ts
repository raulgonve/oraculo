import { NextRequest, NextResponse } from 'next/server';
import { Livepeer } from "@livepeer/ai";

// Inicializa el cliente de Livepeer con tu token de autenticación
const livepeer = new Livepeer({
  httpBearer: process.env.LIVEPEER_TOKEN, // Usa tu token de Livepeer aquí
});

// Función para manejar solicitudes POST
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Genera la imagen usando Livepeer AI
    const result = await livepeer.generate.textToImage({
      prompt: message,
      model_id: "SG161222/Realistic_Vision_V6.0_B1_noVAE", // Modelo de difusión para Livepeer
      width: 1024,                          // Ancho de la imagen
      height: 576,                          // Alto de la imagen
      guidance_scale: 7.5,                  // Escala de guía para la calidad
      num_inference_steps: 50,              // Pasos de inferencia
    });

    // Obtén la URL de la imagen generada
    const imageUrl = result.images[0].url;

    // Retorna la URL de la imagen en la respuesta
    return NextResponse.json({
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Error generando la imagen:', error);
    return new NextResponse('Error generando la imagen', { status: 500 });
  }
}
