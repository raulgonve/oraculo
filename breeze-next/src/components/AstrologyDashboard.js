'use client'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
    TbZodiacLeo,
    TbZodiacSagittarius,
    TbZodiacTaurus,
    TbZodiacGemini,
    TbZodiacCancer,
    TbZodiacLibra,
    TbZodiacVirgo,
    TbZodiacCapricorn, // Icono para elementos avanzados
} from 'react-icons/tb'

const AstrologyDashboard = () => {
    const [astralElements, setAstralElements] = useState([])
    const [advancedElements, setAdvancedElements] = useState([])
    const [aspects, setAspects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAstrologyData = async () => {
            try {
                // Obtener el token CSRF para realizar la solicitud de autenticación
                await fetch('http://localhost:8000/sanctum/csrf-cookie', {
                    method: 'GET',
                    credentials: 'include',
                })

                // Llamada para obtener los elementos
                const elementsResponse = await fetch(
                    'http://localhost:8000/api/get-elements',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors', // Permitir solicitudes CORS
                        credentials: 'include',
                    },
                )

                if (!elementsResponse.ok) {
                    throw new Error('Failed to fetch elements')
                }

                const elementsData = await elementsResponse.json()

                // Separar los elementos en astral y avanzado
                const astrals = elementsData.filter(
                    element => element.element_type === 'Astral',
                )
                const advanced = elementsData.filter(
                    element => element.element_type === 'Advanced',
                )

                setAstralElements(astrals)
                setAdvancedElements(advanced)

                // Llamada para obtener los aspectos
                const aspectsResponse = await fetch(
                    'http://localhost:8000/api/get-aspects',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors', // Permitir solicitudes CORS
                        credentials: 'include',
                    },
                )

                if (!aspectsResponse.ok) {
                    throw new Error('Failed to fetch aspects')
                }

                const aspectsData = await aspectsResponse.json()
                setAspects(aspectsData)

                setLoading(false)
                toast.success('Elements and Aspects fetched successfully')
            } catch (error) {
                toast.error('Failed to fetch data')
                setLoading(false)
            }
        }
        fetchAstrologyData()
    }, [])

    if (loading) {
        return <p className="text-center text-lg">Loading...</p>
    }

    const getZodiacIcon = elementName => {
        switch (elementName) {
            case 'Sun Sign':
                return <TbZodiacLeo className="text-yellow-500 text-4xl" />
            case 'Ascendent':
                return (
                    <TbZodiacSagittarius className="text-purple-500 text-4xl" />
                )
            case 'Moon':
                return <TbZodiacTaurus className="text-blue-500 text-4xl" />
            case 'Mercury':
                return <TbZodiacGemini className="text-green-500 text-4xl" />
            case 'Venus':
                return <TbZodiacVirgo className="text-pink-500 text-4xl" />
            case 'Mars':
                return <TbZodiacCancer className="text-red-500 text-4xl" />
            default:
                return <TbZodiacLibra className="text-indigo-500 text-4xl" />
        }
    }

    const getAdvancedIcon = () => {
        return <TbZodiacCapricorn className="text-gray-500 text-4xl" />
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
                Your Astrological Elements and Aspects
            </h1>

            {/* Title for Astral Elements Section */}
            <h2 className="text-3xl font-bold text-gray-700 mt-8 mb-4 border-b-2 border-gray-300 pb-2">
                Astrological Elements
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {astralElements.map((element, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 transform transition duration-500 hover:scale-105 relative group">
                        <div className="flex items-center mb-4">
                            <div className="mr-4">
                                {getZodiacIcon(element.element_name)}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {element.element_name}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-2">
                            <strong>Description:</strong> {element.description}
                        </p>
                        {/* Meaning displayed on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 text-gray-800">
                            <p className="text-center">
                                <strong>Meaning:</strong> {element.meaning}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Title for Advanced Elements Section */}
            <h2 className="text-3xl font-bold text-gray-700 mt-12 mb-4 border-b-2 border-gray-300 pb-2">
                Advanced Elements
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {advancedElements.map((element, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 transform transition duration-500 hover:scale-105 relative group">
                        <div className="flex items-center mb-4">
                            <div className="mr-4">{getAdvancedIcon()}</div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {element.element_name}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-2">
                            <strong>Description:</strong> {element.description}
                        </p>
                        {/* Meaning displayed on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 text-gray-800">
                            <p className="text-center">
                                <strong>Meaning:</strong> {element.meaning}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Title for Aspects Section */}
            <h2 className="text-3xl font-bold text-gray-700 mt-12 mb-4 border-b-2 border-gray-300 pb-2">
                Astrological Aspects
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {aspects.map((aspect, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 transform transition duration-500 hover:scale-105 relative group">
                        <div className="flex items-center mb-4">
                            <TbZodiacLibra className="text-indigo-500 text-4xl mr-4" />
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {aspect.aspect}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-2">
                            <strong>Involved Planets:</strong>{' '}
                            {Array.isArray(aspect.involved_planets)
                                ? aspect.involved_planets.join(', ')
                                : 'N/A'}
                        </p>
                        <p className="text-gray-600 mb-2">
                            <strong>Aspect Type:</strong> {aspect.aspect_type}
                        </p>
                        {/* Meaning displayed on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 text-gray-800">
                            <p className="text-center">
                                <strong>Meaning:</strong> {aspect.meaning}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <ToastContainer />
        </div>
    )
}

export default AstrologyDashboard
