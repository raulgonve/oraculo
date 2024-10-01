'use client'

import Header from '../Header'
import React from 'react'
import AstralForm from '../../../components/AstralForm' // Ajusta la ruta según la ubicación del archivo

// export const metadata = {
//     title: 'Laravel - Dashboard',
// }

const Dashboard = () => {
    return (
        <>
            <Header title="Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <AstralForm />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
