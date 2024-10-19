'use client'

import Header from '../Header'
import React from 'react'
import SwarmZero from '../../../components/SwarmZero' // Ajusta la ruta según la ubicación del archivo

const Youtube = () => {
    return (
        <>
            <Header title="Video Generation" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <SwarmZero />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Youtube
