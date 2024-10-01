'use client'

import React, { useState, useRef } from 'react'
import { LoadScript, Autocomplete } from '@react-google-maps/api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useChat } from 'ai/react'

export default function AstrologyForm() {
    const [birthDate, setBirthDate] = useState(null)
    const [birthTime, setBirthTime] = useState('')
    const [birthPlace, setBirthPlace] = useState('')
    const [coordinates, setCoordinates] = useState(null)
    const [showResponse, setShowResponse] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const autocompleteRef = useRef(null)
    const { messages, append, stop } = useChat({
        api: '/api/astral',
        onResponse: () => {
            // Mostrar el contenedor de la respuesta cuando el streaming comienza
            setShowResponse(true)
            setIsLoading(false)
        },
    })

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace()
        if (place.geometry) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            const name = `${place.address_components[0].long_name}, ${place.address_components[place.address_components.length - 1].long_name}`
            setBirthPlace(name)
            setCoordinates({ name, latitude: lat, longitude: lng })
        }
    }

    const handleGenerateChart = async e => {
        e.preventDefault()
        if (!birthDate || !birthTime || !coordinates) {
            alert('Please fill in all required fields.')
            return
        }

        // Formatear el mensaje para el API
        const userMessage = `
        {
            "birthDate": "${birthDate}",
            "birthTime": "${birthTime}",
            "birthPlace": "${coordinates.name}"
        }`

        // Mostrar el botón en estado "loading"
        setIsLoading(true)

        // Llamar a la función append para enviar el mensaje
        await append({
            role: 'user',
            content: userMessage,
        })
    }

    // Función para formatear el contenido de la respuesta: convertir **text** en <strong>text</strong>, y los encabezados en sus correspondientes elementos HTML
    const formatResponseContent = content => {
        return content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
                return (
                    <h1 key={index} className="text-2xl font-bold mt-4">
                        {line.substring(2)}
                    </h1>
                )
            } else if (line.startsWith('## ')) {
                return (
                    <h2 key={index} className="text-xl font-semibold mt-3">
                        {line.substring(3)}
                    </h2>
                )
            } else if (line.startsWith('### ')) {
                return (
                    <h3 key={index} className="text-lg font-medium mt-2">
                        {line.substring(4)}
                    </h3>
                )
            } else if (line.startsWith('#### ')) {
                return (
                    <h3 key={index} className="text-lg font-medium mt-2">
                        {line.substring(5)}
                    </h3>
                )
            } else {
                // Formatear texto en negritas con **texto**
                return (
                    <p key={index} className="mt-1">
                        {line.split(/(\*\*.*?\*\*)/).map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                    <strong key={idx}>
                                        {part.slice(2, -2)}
                                    </strong>
                                )
                            }
                            return part
                        })}
                    </p>
                )
            }
        })
    }

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={['places']}>
            <div className="flex justify-center items-start h-screen p-8">
                {/* Formulario para ingresar los datos de nacimiento */}
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-b border-gray-200 mr-8 h-[500px]">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Enter Your Birth Details
                    </h2>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-600 mb-2">
                                Date of Birth
                            </label>
                            <DatePicker
                                selected={birthDate}
                                onChange={date => setBirthDate(date)}
                                dateFormat="yyyy/MM/dd"
                                showYearDropdown
                                yearDropdownItemNumber={100}
                                scrollableYearDropdown
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-600 mb-2">
                                Time of Birth
                            </label>
                            <input
                                type="time"
                                value={birthTime}
                                onChange={e => setBirthTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-600 mb-2">
                                Place of Birth
                            </label>
                            <Autocomplete
                                onLoad={autocomplete =>
                                    (autocompleteRef.current = autocomplete)
                                }
                                onPlaceChanged={handlePlaceChanged}>
                                <input
                                    type="text"
                                    placeholder="Enter place"
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                />
                            </Autocomplete>
                        </div>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleGenerateChart}
                                className="w-full py-3 px-4 bg-purple-500 text-white rounded bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 transition duration-300"
                                disabled={isLoading}>
                                {isLoading
                                    ? 'Generating...'
                                    : 'Generate Basic Astrological Data'}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Contenedor para mostrar la respuesta de la API */}
                {showResponse && (
                    <div className="bg-white p-8 rounded-lg shadow-md border-b border-gray-200 w-full max-w-md ml-8 overflow-y-auto h-[500px]">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                                Astrological Chart Data:
                            </h2>
                            <button
                                onClick={stop}
                                className="text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition duration-300">
                                Stop
                            </button>
                        </div>
                        <div className="space-y-2">
                            {messages
                                .filter(m => m.role === 'assistant') // Filtrar solo los mensajes del asistente
                                .map((m, index) => (
                                    <div
                                        key={m.id}
                                        className="whitespace-pre-wrap">
                                        {formatResponseContent(m.content)}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </LoadScript>
    )
}
