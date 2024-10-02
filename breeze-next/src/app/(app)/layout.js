'use client'

import { useAuth } from '../../hooks/auth'
import Navigation from '@/app/(app)/Navigation'
import Loading from '@/app/(app)/Loading'
import { LoadScript } from '@react-google-maps/api'

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    if (!user) {
        return <Loading />
    }

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={['places']}>
            <div className="min-h-screen bg-gray-100">
                <Navigation user={user} />

                <main>{children}</main>
            </div>
        </LoadScript>
    )
}

export default AppLayout
