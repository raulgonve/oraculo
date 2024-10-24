'use client'
import React from 'react'
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
    TbZodiacCapricorn,
    TbZodiacPisces,
    TbZodiacAries,
    TbZodiacScorpio,
    TbZodiacAquarius,
    TbPlanet,
} from 'react-icons/tb'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

// Import necessary Swiper modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

// Zodiac images paths
const zodiacImages = [
    '/images/aquarius.png',
    '/images/aries.png',
    '/images/cancer.png',
    '/images/capricorn.png',
    '/images/gemini.png',
    '/images/leo.png',
    '/images/libra.png',
    '/images/pisces.png',
    '/images/sagittarius.png',
    '/images/scorpio.png',
    '/images/taurus.png',
    '/images/virgo.png',
]

const AstrologyDashboard = () => {
    // State to store astral elements, advanced elements, and aspects
    const [astralElements, setAstralElements] = useState([])
    const [advancedElements, setAdvancedElements] = useState([])
    const [aspects, setAspects] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch astrological data when the component mounts
    useEffect(() => {
        const fetchAstrologyData = async () => {
            try {
                // Get CSRF token for authentication
                await fetch('http://localhost:8000/sanctum/csrf-cookie', {
                    method: 'GET',
                    credentials: 'include',
                })

                // Fetch astral elements
                const elementsResponse = await fetch(
                    'http://localhost:8000/api/get-elements',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors', // Allow CORS requests
                        credentials: 'include',
                    },
                )

                if (!elementsResponse.ok) {
                    throw new Error('Failed to fetch elements')
                }

                const elementsData = await elementsResponse.json()

                // Separate elements into astral and advanced types
                const astrals = elementsData.filter(
                    element => element.element_type === 'Astral',
                )
                const advanced = elementsData.filter(
                    element => element.element_type === 'Advanced',
                )

                setAstralElements(astrals)
                setAdvancedElements(advanced)

                // Fetch aspects
                const aspectsResponse = await fetch(
                    'http://localhost:8000/api/get-aspects',
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors', // Allow CORS requests
                        credentials: 'include',
                    },
                )

                if (!aspectsResponse.ok) {
                    throw new Error('Failed to fetch aspects')
                }

                const aspectsData = await aspectsResponse.json()
                setAspects(aspectsData)

                setLoading(false)
                // toast.success('Elements and Aspects fetched successfully')
            } catch (error) {
                toast.error('Failed to fetch data')
                setLoading(false)
            }
        }
        fetchAstrologyData()
    }, [])

    // Show loading indicator while data is being fetched
    if (loading) {
        return <p className="text-center text-lg">Loading...</p>
    }

    // Zodiac icons mapping
    const zodiacIcons = {
        Aries: <TbZodiacAries />,
        Taurus: <TbZodiacTaurus />,
        Gemini: <TbZodiacGemini />,
        Cancer: <TbZodiacCancer />,
        Leo: <TbZodiacLeo />,
        Virgo: <TbZodiacVirgo />,
        Libra: <TbZodiacLibra />,
        Scorpio: <TbZodiacScorpio />,
        Sagittarius: <TbZodiacSagittarius />,
        Capricorn: <TbZodiacCapricorn />,
        Aquarius: <TbZodiacAquarius />,
        Pisces: <TbZodiacPisces />,
    }

    // Function to get random color classes for styling zodiac icons
    const getRandomColorClass = () => {
        const colors = [
            'text-red-500',
            'text-green-500',
            'text-blue-500',
            'text-yellow-500',
            'text-purple-500',
            'text-indigo-500',
            'text-pink-500',
        ]
        return colors[Math.floor(Math.random() * colors.length)]
    }

    // Function to get zodiac icon based on element description
    const getZodiacIcon = description => {
        const sign = Object.keys(zodiacIcons).find(key =>
            description.toLowerCase().includes(key.toLowerCase()),
        )
        if (sign) {
            return React.cloneElement(zodiacIcons[sign], {
                className: `${getRandomColorClass()} text-4xl`,
            })
        }
        return (
            <TbZodiacLibra
                className={`${getRandomColorClass()} text-4xl`} // Default icon if no match found
            />
        )
    }

    // Function to get random house numbers (for illustrative purposes)
    const getHouseNumber = () => {
        const houseNumbers = [
            '1st House',
            '2nd House',
            '3rd House',
            '4th House',
            '5th House',
            '6th House',
            '7th House',
            '8th House',
            '9th House',
            '10th House',
            '11th House',
            '12th House',
        ]
        return houseNumbers[Math.floor(Math.random() * houseNumbers.length)]
    }

    // If no astral elements, display welcome message
    if (astralElements.length === 0) {
        return <p className="text-center text-lg">Welcome to Oraculo AI!</p>
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
                Your Astrological Elements and Aspects
            </h1>
            <div className="w-full mx-auto mb-10">
                {/* Zodiac sign images carousel */}
                <Swiper
                    spaceBetween={20}
                    slidesPerView={5}
                    autoplay={{ delay: 3000 }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}>
                    {zodiacImages.map((src, index) => (
                        <SwiperSlide key={index}>
                            <div className="flex-shrink-0 w-full h-56 overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={src}
                                    alt={`Zodiac Sign Image ${index}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Astral Elements Section */}
            <h2 className="text-3xl font-bold text-gray-700 mt-8 mb-4 border-b-2 border-gray-300 pb-2">
                Your Astrological Elements
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {astralElements.map((element, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 transform transition duration-500 hover:scale-105 relative group">
                        <div className="flex items-center mb-4">
                            <div className="mr-4">
                                {getZodiacIcon(element.description)}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {element.element_name}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-2">
                            <h3 className="text-xl font-semibold text-gray-500 text-center">
                                {element.description}
                            </h3>
                        </p>
                        {/* Meaning displayed on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 text-gray-800">
                            <p className="text-center bg-white shadow-md">
                                <strong>Meaning:</strong> {element.meaning}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Elements Section */}
            <h2 className="text-3xl font-bold text-gray-700 mt-12 mb-4 border-b-2 border-gray-300 pb-2">
                Your Advanced Elements
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {advancedElements.map((element, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 transform transition duration-500 hover:scale-105 relative group">
                        <div className="flex items-center mb-4">
                            <div className="mr-4">
                                {getZodiacIcon(element.description)}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {element.element_name}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-2 text-center">
                            <h3 className="text-xl font-semibold text-gray-500 text-center">
                                {element.description}
                            </h3>
                        </p>
                        {/* Meaning displayed on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 text-gray-800">
                            <p className="text-center bg-white shadow-md">
                                <strong>Meaning:</strong> {element.meaning}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Astrological Aspects Section */}
            <h2 className="text-3xl font-bold text-gray-700 mt-12 mb-4 border-b-2 border-gray-300 pb-2">
                Your Astrological Aspects
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {aspects.map((aspect, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 transform transition duration-500 hover:scale-105 relative group">
                        <div className="flex items-center mb-4">
                            <TbPlanet
                                className={`${getRandomColorClass()} text-4xl mr-4`}
                            />
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {aspect.aspect}
                            </h2>
                        </div>
                        <p className="text-gray-600 mb-2 text-center">
                            <strong className="border-b-2 border-gray-300">
                                Involved Planets
                            </strong>{' '}
                            <br></br>{' '}
                            {Array.isArray(aspect.involved_planets)
                                ? aspect.involved_planets.join(', ')
                                : aspect.involved_planets}
                        </p>
                        <p className="text-gray-600 mb-2 text-center">
                            <strong className="border-b-2 border-gray-300">
                                Aspect Type
                            </strong>{' '}
                            <br></br> {aspect.aspect_type}
                        </p>
                        {/* Meaning displayed on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-4 text-gray-800">
                            <p className="text-center text-center bg-white shadow-md">
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
