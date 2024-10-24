'use client'

import Header from '../Header'
import React from 'react'
import Story from '../../../components/StoryProtocol' // Adjust the path based on the file's location
import { useAuth } from '../../../hooks/auth'

const Nft = () => {
    // Using the authentication hook to get the current user
    const { user } = useAuth({ middleware: 'auth' }) // Ensure user is authenticated

    return (
        <>
            {/* Header component with a title */}
            <Header title="Astral NFT" />

            {/* Main content section */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Container for the StoryProtocol component */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* StoryProtocol component renders NFT-related content, passing the user data */}
                            <Story user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Nft
