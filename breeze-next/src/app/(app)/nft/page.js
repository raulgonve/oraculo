'use client'

import Header from '../Header'
import React from 'react'
import Story from '../../../components/StoryProtocol' // Ajusta la ruta según la ubicación del archivo
import { useAuth } from '../../../hooks/auth'

const Nft = () => {
    const { user } = useAuth({ middleware: 'auth' })
    return (
        <>
            <Header title="Astral NFT" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <Story user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Nft
