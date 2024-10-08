"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";

export default function AstroChat() {
  const {
    messages,
    input,
    handleInputChange,
    setMessages,
    append,
    isLoading
  } = useChat();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Controla la visibilidad del modal

  useEffect(() => {
    // Por defecto agrega un mensaje inicial del asistente
    if (messages.length === 0) {
      const defaultMessage = { role: "assistant", content: "How can I assist you today?" };
      setMessages([defaultMessage]);
    }

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCustomSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return; // Evitar el envío de mensajes vacíos

    // Agregar el mensaje del usuario a los mensajes
    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = { role: "assistant", content: "" }; // Crear un mensaje de IA vacío
        setMessages((prevMessages) => [...prevMessages, assistantMessage]); // Agregar el mensaje de IA

        let result = '';

        // Leer el stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // Decodificar el fragmento recibido
          result += decoder.decode(value);
        }

        setMessages((prevMessages) =>
            prevMessages.map((message) =>
              message === assistantMessage
                ? { ...assistantMessage, content: result }
                : message
            )
          );

      } else {
        console.error("Error al obtener la respuesta del asistente");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    } finally {
      setIsSending(false);
      handleInputChange({ target: { value: "" } }); // Limpiar el input
    }
  };

  const generateImage = async () => {
    setImageIsLoading(true);
    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messages[messages.length - 1].content,
      }),
    });
    const data = await response.json();
    setImage(data);
    setImageIsLoading(false);
    setShowModal(true); // Mostrar el modal cuando la imagen se genera
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center p-8 h-[600px] w-[80%] max-w-5xl mx-auto">
      {/* Contenedor del chat */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full border-b border-gray-200 flex flex-col">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Astro Chat
        </h2>
        {/* Área de mensajes con scroll */}
        <div
          className="flex-1 overflow-y-auto mb-4"
          ref={messagesContainerRef}
        >
          {messages.map((m, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap p-3 m-2 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-500 text-white" // Color ajustado para el usuario
                  : "bg-gray-300 text-black" // Color ajustado para el asistente
              }`}
            >
              {m.role === "user" ? (
                <>
                  User: {m.content}
                </>
              ) : (
                // Renderizar el contenido del asistente como HTML
                <div dangerouslySetInnerHTML={{ __html: "AI: " + m.content }} />
              )}
            </div>
          ))}
          {(isSending) && (
            <div className="flex justify-end pr-4">
              <span className="animate-pulse text-2xl">...</span>
            </div>
          )}
        </div>

        {/* Formulario de entrada para el chat */}
        <form onSubmit={handleCustomSubmit} className="w-full flex flex-col items-center">
          <div className="w-full flex items-center">
            <input
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-black"
              value={input}
              placeholder="How can I assist you today?..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="ml-2 py-2 px-4 bg-blue-500 text-white rounded bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 transition duration-300 shadow-md"
              disabled={isSending}
            >
              Send
            </button>
          </div>

          {/* Botón Generate Image dentro de la caja del chat */}
          <div className="mt-4 flex flex-col items-center">
            {messages.length > 2 && !isLoading && (
              <button
                className="bg-blue-500 p-2 text-white rounded shadow-xl mb-4"
                disabled={isLoading || imageIsLoading}
                onClick={generateImage}
              >
                Generate Image
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Spinner mientras se carga la imagen */}
      {imageIsLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}

      {/* Modal para mostrar la imagen generada */}
      {showModal && image && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt="Generated"
              className="rounded-lg shadow-lg max-w-full h-auto object-contain"
            />
            <button
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
