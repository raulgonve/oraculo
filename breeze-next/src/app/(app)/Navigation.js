import ApplicationLogo from '@/components/ApplicationLogo'
import Dropdown from '@/components/Dropdown'
import Link from 'next/link'
import NavLink from '@/components/NavLink'
import ResponsiveNavLink, {
    ResponsiveNavButton,
} from '@/components/ResponsiveNavLink'
import { DropdownButton } from '@/components/DropdownLink'
import { useAuth } from '@/hooks/auth'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAccount, useEnsName } from 'wagmi'

const Navigation = ({ user }) => {
    const { logout } = useAuth()
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [account, setAccount] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    // Obtener la dirección de la cuenta conectada
    const { address } = useAccount()
    // Obtener el ENS si existe para la dirección conectada
    const { data: ensName } = useEnsName({ address })

    // Función para conectar la billetera
    const connectWallet = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                })

                if (accounts && accounts.length > 0) {
                    setAccount(accounts[0])
                    setIsWalletConnected(true)
                    setErrorMessage('')
                } else {
                    setErrorMessage('No accounts found. Please try again.')
                }
            } catch (error) {
                setErrorMessage('Error connecting wallet. Please try again.')
            }
        } else {
            setErrorMessage(
                'No Ethereum provider detected. Please install MetaMask.',
            )
        }
    }

    useEffect(() => {
        if (address) {
            setAccount(address)
            setIsWalletConnected(true)
        }
    }, [address])

    return (
        <nav className="bg-white border-b border-gray-100">
            {/* Primary Navigation Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard">
                                <ApplicationLogo className="block h-10 w-auto fill-current text-gray-600" />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden sm:flex space-x-8 ml-10">
                            {[
                                { href: '/dashboard', label: 'Dashboard' },
                                { href: '/astral', label: 'Astral Chart' },
                                { href: '/astrobot', label: 'AstroBot' },
                                { href: '/horoscope', label: 'Horoscope' },
                                { href: '/nft', label: 'Astral NFT' },
                                { href: '/zora', label: 'Zora' },
                            ].map(link => (
                                <NavLink
                                    key={link.href}
                                    href={link.href}
                                    active={pathname === link.href}
                                    className="text-gray-600 font-medium transition duration-150 ease-in-out">
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Settings Dropdown */}
                    <div className="hidden sm:flex sm:items-center sm:ml-6">
                        {isWalletConnected ? (
                            <Dropdown
                                align="right"
                                width="48"
                                trigger={
                                    <button className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-500 focus:outline-none transition duration-150 ease-in-out">
                                        <div>
                                            {user?.name}{' '}
                                            {ensName
                                                ? `(${ensName})`
                                                : `(${account?.slice(0, 6)}...${account?.slice(-4)})`}
                                        </div>
                                        <div className="ml-1">
                                            <svg
                                                className="fill-current h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </button>
                                }>
                                <DropdownButton onClick={logout}>
                                    Logout
                                </DropdownButton>
                            </Dropdown>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="bg-blue-500 text-white px-4 py-2 rounded">
                                Connect Wallet
                            </button>
                        )}
                    </div>

                    {/* Hamburger Menu for Mobile */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setOpen(prev => !prev)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out">
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24">
                                {open ? (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Navigation Menu */}
            {open && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {[
                            { href: '/dashboard', label: 'Dashboard' },
                            { href: '/astral', label: 'Astral Chart' },
                            { href: '/astrobot', label: 'AstroBot' },
                            { href: '/horoscope', label: 'Horoscope' },
                            { href: '/nft', label: 'Images' },
                            { href: '/zora', label: 'Zora' },
                        ].map(link => (
                            <ResponsiveNavLink
                                key={link.href}
                                href={link.href}
                                active={pathname === link.href}>
                                {link.label}
                            </ResponsiveNavLink>
                        ))}
                    </div>

                    {/* Responsive Settings Options */}
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-10 w-10 fill-current text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>

                            <div className="ml-3">
                                <div className="font-medium text-base text-gray-800">
                                    {user?.name}
                                </div>
                                <div className="font-medium text-sm text-gray-500">
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavButton onClick={logout}>
                                Logout
                            </ResponsiveNavButton>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navigation
