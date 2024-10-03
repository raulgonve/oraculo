'use client'

import React, { useState, useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useChat } from 'ai/react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AstrologyForm({ user }) {
    const [birthDate, setBirthDate] = useState(new Date('1985-07-31'))
    const [birthTime, setBirthTime] = useState('03:45')
    const [birthPlace, setBirthPlace] = useState('')
    const [coordinates, setCoordinates] = useState(null)
    const [showResponse, setShowResponse] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isResponseFinished, setIsResponseFinished] = useState(false) // Para mostrar botones adicionales al finalizar
    const [audioIsLoading, setAudioIsLoading] = useState(false)
    const [isSavingChart, setIsSavingChart] = useState(false)
    const [audio, setAudio] = useState(null)
    const autocompleteRef = useRef(null)
    const { messages, append, stop } = useChat({
        api: '/api/astral',
        onResponse: () => {
            // Mostrar el contenedor de la respuesta cuando el streaming comienza
            setShowResponse(true)
            setIsLoading(false)
            setIsResponseFinished(false)
        },
        onFinish: () => {
            // Indicar que el streaming ha terminado
            setIsResponseFinished(true)
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
    const fetchCsrfToken = async () => {
        await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
            {
                method: 'GET',
                credentials: 'include',
            },
        )
    }

    const handleGenerateChart = async e => {
        e.preventDefault()
        if (!birthDate || !birthTime || !coordinates) {
            alert('Please fill in all required fields.')
            return
        }
        // Limpiar mensajes previos al comenzar una nueva generación
        setAudio(null) // Limpiar audio generado anteriormente

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
        // Mostrar el contenedor de la respuesta
        setShowResponse(true)
    }

    const handleGenerateAudio = async () => {
        if (!messages.length) return

        setAudioIsLoading(true)
        const response = await fetch('/api/audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: messages
                    .filter(m => m.role === 'assistant')
                    .map(m => m.content)
                    .join(' '),
            }),
        })

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudio(audioUrl)
        setAudioIsLoading(false)
    }

    // Función para formatear el contenido de la respuesta
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

    const handleSaveChart = async () => {
        setIsSavingChart(true)
        try {
            const response = await fetch('/api/chart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: user.name,
                    birth_date: birthDate,
                    birth_time: birthTime,
                    birth_place: birthPlace,
                    astrological_chart: messages, // Mensajes con la carta astral
                    audio_summary: audio, // Resumen del audio generado
                }),
            })

            if (response.ok) {
                const jsonResponse = await response.json()
                const content = jsonResponse.data

                // Obtener el token CSRF antes de hacer la solicitud
                await fetchCsrfToken()

                // Enviar los datos extraídos al controlador de Laravel
                const resp = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/elements`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-XSRF-TOKEN': decodeURIComponent(
                                getCookie('XSRF-TOKEN'),
                            ), // Incluir el token CSRF
                        },
                        body: JSON.stringify({
                            birth_date: birthDate,
                            birth_time: birthTime,
                            birth_place: birthPlace,
                            astrals: content.astral,
                            advance: content.advance,
                            aspects: content.aspects,
                        }),
                        credentials: 'include', // Incluir credenciales para enviar cookies
                    },
                )
                if (resp.ok) {
                    toast.success(
                        'Elements and aspects created successfully! 🚀',
                    )
                } else {
                    toast.error('Failed to save the chart. Please try again.🚨')
                }
            } else {
                toast.error('Failed to save the chart. Please try again.🚨')
                console.error('Failed to save chart:', await response.text())
            }
            setIsSavingChart(false)
        } catch (error) {
            console.error('Error saving chart:', error)
            setIsSavingChart(false)
        }
    }

    return (
        <div className="flex justify-center items-start p-8">
            <ToastContainer />
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
                                value={birthPlace}
                                onChange={e => setBirthPlace(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                            />
                        </Autocomplete>
                    </div>
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={handleGenerateChart}
                            className="w-full py-3 px-4 bg-purple-500 text-white rounded bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 transition duration-300 shadow-md"
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
                                <div key={m.id} className="whitespace-pre-wrap">
                                    {formatResponseContent(m.content)}
                                </div>
                            ))}
                    </div>
                    {/* Botones adicionales al finalizar la respuesta */}
                    {isResponseFinished && (
                        <>
                            <div className="flex space-x-4 mt-4">
                                {!audioIsLoading && !audio && (
                                    <button
                                        className="w-full py-3 px-4 text-blue-500 border border-blue-500 rounded  bg-gradient-to-r from-white-400 to-white-500 hover:text-white hover:from-teal-400 hover:to-blue-500  transition duration-300 shadow-md"
                                        onClick={handleGenerateAudio}>
                                        Generate Audio
                                    </button>
                                )}
                                <button
                                    className={`w-full py-3 px-4 rounded bg-gradient-to-r from-white-400 to-white-500 hover:text-white transition duration-300 shadow-md ${
                                        isSavingChart
                                            ? 'text-gray-500 border border-gray-500 cursor-not-allowed'
                                            : 'text-green-500 border border-green-500 hover:from-green-400 hover:to-green-600 hover:text-white'
                                    }`}
                                    onClick={handleSaveChart}
                                    disabled={isSavingChart}>
                                    {isSavingChart
                                        ? 'Saving Chart...'
                                        : 'Save Chart'}
                                </button>
                            </div>
                            {audioIsLoading && !audio && (
                                <p className="mt-4 text-gray-700">
                                    Audio is being generated...
                                </p>
                            )}
                            {isSavingChart && (
                                <p className="mt-4 text-gray-700">
                                    Saving chart...
                                </p>
                            )}
                            {audio && (
                                <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full mt-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        Summary of Your Astrological Chart:
                                    </h3>
                                    <audio
                                        controls
                                        src={audio}
                                        className="w-full mb-2"></audio>
                                    <p className="text-sm text-gray-500">
                                        Listen to the most important points and
                                        conclusions about your astrological
                                        chart.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
// Utility function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        const lastPart = parts.pop() // Puede ser undefined
        if (lastPart) {
            return lastPart.split(';').shift() || ''
        }
    }
    return '' // Retornar una cadena vacía si la cookie no está presente
}
