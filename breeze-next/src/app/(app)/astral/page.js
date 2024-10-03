'use client'

import Header from '../Header'
import React from 'react'
import AstralForm from '../../../components/AstralForm' // Ajusta la ruta según la ubicación del archivo
import { useAuth } from '../../../hooks/auth'

// export const metadata = {
//     title: 'Laravel - Dashboard',
// }

const Astral = () => {
    const { user } = useAuth({ middleware: 'auth' })
    return (
        <>
            <Header title="Astral Chart" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <AstralForm user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Astral
