'use client'

import Header from '../Header'
import React from 'react'
import SwarmZero from '../../../components/SwarmZero' // Adjust the path based on the file's location

// Component to render the YouTube video generation page
const Youtube = () => {
    return (
        <>
            {/* Header component with a title */}
            <Header title="Video Generation" />

            {/* Main content section */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Container for SwarmZero component */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* SwarmZero component renders the video generation content */}
                            <SwarmZero />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Youtube
