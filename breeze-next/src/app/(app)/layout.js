'use client'

import { useAuth } from '@/hooks/auth'
import Navigation from '@/app/(app)/Navigation'
import Loading from '@/app/(app)/Loading'
import { WagmiConfig } from 'wagmi' // Configures Wagmi for Ethereum wallet management
import { config } from '../../lib/config' // Wagmi configuration file
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // Manages server state
import { LoadScript } from '@react-google-maps/api' // Google Maps API integration

// Create a new react-query client
const queryClient = new QueryClient()

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: 'auth' }) // Authenticate user using a middleware

    // Display loading component while user authentication is processing
    if (!user) {
        return <Loading />
    }

    return (
        // Load Google Maps scripts with the API key and required libraries
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={['places']}>
            {/* Provide the react-query client to the app */}
            <QueryClientProvider client={queryClient}>
                {/* Provide Wagmi config for Ethereum wallet connection */}
                <WagmiConfig config={config}>
                    <div className="min-h-screen bg-gray-100">
                        {/* Pass the authenticated user to the navigation */}
                        <Navigation user={user} />
                        <main>{children}</main> {/* Render the main content */}
                    </div>
                </WagmiConfig>
            </QueryClientProvider>
        </LoadScript>
    )
}

export default AppLayout
