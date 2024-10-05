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
  } = useChat();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCustomSubmit = async (e: React.FormEvent) => {
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

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        let chunk;
        let assistantMessage = { role: "assistant", content: "" };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        while (!(chunk = await reader.read()).done) {
          const chunkText = new TextDecoder().decode(chunk.value);
          assistantMessage.content += chunkText;
          setMessages((prevMessages) =>
            prevMessages.map((message) =>
              message === assistantMessage
                ? { ...assistantMessage }
                : message
            )
          );
        }
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

  const handleRandomRecipe = async () => {
    // Enviar un mensaje predeterminado para solicitar una receta aleatoria
    const randomMessage = { role: "user", content: "Give me a random recipe" };
    setMessages((prevMessages) => [...prevMessages, randomMessage]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, randomMessage],
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        let chunk;
        let assistantMessage = { role: "assistant", content: "" };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);

        while (!(chunk = await reader.read()).done) {
          const chunkText = new TextDecoder().decode(chunk.value);
          assistantMessage.content += chunkText;
          setMessages((prevMessages) =>
            prevMessages.map((message) =>
              message === assistantMessage
                ? { ...assistantMessage }
                : message
            )
          );
        }
      } else {
        console.error("Error al obtener la respuesta del asistente");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 h-[600px] w-[80%] max-w-5xl mx-auto">
      {/* Contenedor del chat */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full h-full border-b border-gray-200 flex flex-col">
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
              {m.role === "user" ? "User: " : "AI: "}
              {m.content}
            </div>
          ))}
          {(isSending) && (
            <div className="flex justify-end pr-4">
              <span className="animate-pulse text-2xl">...</span>
            </div>
          )}
        </div>
        {/* Botón para acción adicional */}
        <div className="flex justify-center mb-4">
          <button
            className="w-full py-3 px-4 bg-purple-500 text-white rounded bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 transition duration-300 shadow-md"
            disabled={isSending}
            onClick={handleRandomRecipe}
          >
            Random Recipe
          </button>
        </div>
        {/* Formulario de entrada para el chat */}
        <form onSubmit={handleCustomSubmit} className="w-full">
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-black"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}
