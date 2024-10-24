'use client'
import React, { useState, useEffect } from 'react'
import { FaSun, FaMoon, FaArrowUp } from 'react-icons/fa' // Icons for astrological signs
import {
    IoCalendarOutline,
    IoLocationOutline,
    IoTimeOutline,
} from 'react-icons/io5'
import Link from 'next/link'

export default function HoroscopeGenerator({ user }) {
    const [userAstroData, setUserAstroData] = useState(null) // Holds user's astrological data
    const [horoscope, setHoroscope] = useState('') // The horoscope result
    const [isLoading, setIsLoading] = useState(false) // Loading state for fetching the horoscope
    const [hasData, setHasData] = useState(true) // Indicates if user's astrological data is present

    // Fetch the user's astrological data from the backend when the component mounts
    useEffect(() => {
        const fetchUserAstroData = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/horoscope-data`,
                    {
                        method: 'GET',
                        credentials: 'include', // Include session cookies
                    },
                )
                if (response.ok) {
                    const data = await response.json()
                    if (
                        data.birth_date &&
                        data.birth_time &&
                        data.birth_place
                    ) {
                        setUserAstroData({
                            name: user?.name,
                            birthDate: data.birth_date,
                            birthTime: data.birth_time,
                            birthPlace: data.birth_place,
                            sun: data.sun,
                            moon: data.moon,
                            ascendant: data.ascendant,
                        })
                    } else {
                        setHasData(false) // User data is incomplete
                    }
                } else {
                    console.error('Failed to fetch user astro data')
                }
            } catch (error) {
                console.error('Error fetching user astro data:', error)
            }
        }

        fetchUserAstroData()
    }, [])

    // Fetch CSRF token for secure communication
    const fetchCsrfToken = async () => {
        await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
            {
                method: 'GET',
                credentials: 'include',
            },
        )
    }

    // Handles the action to generate the horoscope using the user’s astrological data
    const handleGenerateHoroscope = async () => {
        if (!userAstroData) return
        setIsLoading(true)
        setHoroscope('') // Clear previous horoscope

        try {
            const response = await fetch(`/api/horoscope`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userAstroData),
            })

            if (response.body) {
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let result = ''

                // Read the streaming response
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    result += decoder.decode(value)
                    setHoroscope(prev => prev + decoder.decode(value)) // Append the result to the horoscope state
                }
            } else {
                console.error('Failed to generate horoscope: No response body')
            }
        } catch (error) {
            console.error('Error generating horoscope:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Display a message if the user's astrological data is missing
    if (!hasData) {
        return (
            <div className="flex flex-col items-center p-8 w-[90%] max-w-5xl mx-auto">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
                    Your Horoscope
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    It seems that your birth details are missing. Please
                    generate and save your astral chart to proceed.
                </p>
                <Link
                    href="/astral-chart"
                    className="text-blue-600 hover:underline">
                    Go to Astral Chart
                </Link>
            </div>
        )
    }

    // Main render with user astrological data and horoscope generation
    return (
        <div className="flex flex-col items-center p-8 w-[90%] max-w-5xl mx-auto ">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
                Your Personalized Daily Horoscope
            </h2>
            <p className="text-md text-center text-gray-600 mb-6">
                Discover insights tailored to you, generated by an AI agent
                trained with renowned astrology books for accuracy and depth.
            </p>

            {userAstroData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
                    {/* Card 1: Birth Details */}
                    <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center border-b-2 border-gray-300">
                            Birth Details
                        </h3>
                        <p className="text-lg font-medium">
                            <IoCalendarOutline className="inline-block mr-2 text-blue-500" />
                            <span className="font-bold text-gray-800">
                                Date of Birth:
                            </span>{' '}
                            {userAstroData.birthDate}
                        </p>
                        <p className="text-lg font-medium mt-2">
                            <IoTimeOutline className="inline-block mr-2 text-blue-500" />
                            <span className="font-bold text-gray-800">
                                Time of Birth:
                            </span>{' '}
                            {userAstroData.birthTime}
                        </p>
                        <p className="text-lg font-medium mt-2">
                            <IoLocationOutline className="inline-block mr-2 text-blue-500" />
                            <span className="font-bold text-gray-800">
                                Place of Birth:
                            </span>{' '}
                            {userAstroData.birthPlace}
                        </p>
                    </div>

                    {/* Card 2: Astrological Signs */}
                    <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center border-b-2 border-gray-300">
                            Astrological Signs
                        </h3>
                        <p className="text-lg font-medium">
                            <FaSun className="inline-block mr-2 text-yellow-500" />
                            <span className="font-bold text-gray-800">
                                Sun Sign:
                            </span>{' '}
                            {userAstroData.sun}
                        </p>
                        <p className="text-lg font-medium mt-2">
                            <FaMoon className="inline-block mr-2 text-blue-500" />
                            <span className="font-bold text-gray-800">
                                Moon Sign:
                            </span>{' '}
                            {userAstroData.moon}
                        </p>
                        <p className="text-lg font-medium mt-2">
                            <FaArrowUp className="inline-block mr-2 text-red-500" />
                            <span className="font-bold text-gray-800">
                                Ascendant:
                            </span>{' '}
                            {userAstroData.ascendant}
                        </p>
                    </div>
                </div>
            )}

            {/* Button to Generate Horoscope */}
            <button
                onClick={handleGenerateHoroscope}
                disabled={isLoading}
                className="w-full max-w-sm py-4 px-6 mt-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300">
                {isLoading ? 'Generating...' : 'Generate Horoscope'}
            </button>

            {/* Show the Horoscope */}
            {horoscope && (
                <div className="w-full mt-8 p-6 border border-gray-200 rounded-2xl bg-white shadow-lg hover:shadow-2xl  transform hover:scale-105 transition-all duration-500">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                        Unlock the Secrets of Your Day, {user?.name}!
                    </h3>
                    <div
                        className="text-lg text-gray-700"
                        dangerouslySetInnerHTML={{ __html: horoscope }} // Render the horoscope with HTML
                    ></div>
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
        const lastPart = parts.pop() // Can be undefined
        if (lastPart) {
            return lastPart.split(';').shift() || ''
        }
    }
    return '' // Return empty string if cookie not found
}
