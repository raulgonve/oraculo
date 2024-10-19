'use client'

import { useAuth } from '@/hooks/auth'
import Navigation from '@/app/(app)/Navigation'
import Loading from '@/app/(app)/Loading'
import { WagmiConfig } from 'wagmi'
import { config } from '../../lib/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoadScript } from '@react-google-maps/api'

// Crear un nuevo cliente de react-query
const queryClient = new QueryClient()

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' })

    if (!user) {
        return <Loading />
    }

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={['places']}>
            <QueryClientProvider client={queryClient}>
                <WagmiConfig config={config}>
                    <div className="min-h-screen bg-gray-100">
                        <Navigation user={user} />
                        <main>{children}</main>
                    </div>
                </WagmiConfig>
            </QueryClientProvider>
        </LoadScript>
    )
}

export default AppLayout
