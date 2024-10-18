'use client'
import { useState, useEffect } from 'react'
import Modal from 'react-modal'

export default function StoryProtocol({ user }) {
    const [isLoading, setIsLoading] = useState(false)
    const [imageIsLoading, setImageIsLoading] = useState(false)
    const [imageResponses, setImageResponses] = useState([]) // Array para almacenar las imágenes
    const [nftData, setNftData] = useState(null) // Almacenar datos del NFT
    const [userAstroData, setUserAstroData] = useState(null)
    const [hasData, setHasData] = useState(true)
    const [prompts, setPrompts] = useState([]) // Array para almacenar múltiples prompts
    const [modalIsOpen, setModalIsOpen] = useState(false) // Estado del modal

    useEffect(() => {
        const fetchAstralPrompt = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/horoscope-data`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    },
                )
                if (response.ok) {
                    const data = await response.json()
                    if (
                        data.birth_date &&
                        data.birth_time &&
                        data.birth_place &&
                        data.sun
                    ) {
                        setUserAstroData({
                            name: user?.name,
                            birthDate: data.birth_date,
                            birthTime: data.birth_time,
                            birthPlace: data.birth_place,
                            sun: data.sun,
                            moon: data.moon,
                            ascendant: data.ascendant,
                        })

                        const generatedPrompts = [
                            `A powerful and majestic representation of the ${data.sun} zodiac sign radiating power and creativity. Colors of the universe swirl around, set against a breathtaking landscape of swirling nebulas, vibrant planets, and distant galaxies.`,
                            `A futuristic, mythological representation of the zodiac sign ${data.sun}, blending ancient Greek astrology with advanced science fiction technology. The central figure embodies the spirit of ${data.sun}, adorned in glowing cosmic armor, surrounded by swirling galaxies, distant planets, and radiant constellations.`,
                            `A majestic and powerful representation of the ${data.sun} zodiac sign, centered prominently in the image. Surrounding it, the elements of air, earth, fire, and water swirl and blend in a cosmic dance. At the bottom corner, a glowing signature reads 'Oraculo.'`,
                            `An ethereal portrayal of the ${data.sun} zodiac sign, where celestial beings and cosmic energies converge. The figure of the zodiac sign rises from the cosmic dust, surrounded by shimmering stardust and celestial wings. Constellations form a radiant crown above, while beams of light from distant stars highlight the mystical aura. Planets and ancient symbols orbit in harmony around the figure, creating a sense of divine balance and cosmic power.`,
                        ]
                        setPrompts(generatedPrompts)
                    } else {
                        setHasData(false)
                    }
                } else {
                    console.error('Failed to fetch user astro data')
                }
            } catch (error) {
                console.error('Error fetching user astro data:', error)
            }
        }

        fetchAstralPrompt()
    }, [user])

    const handleGenerateImage = async () => {
        if (prompts.length === 0) return
        setIsLoading(true)
        setImageResponses([]) // Limpiar imágenes previas

        try {
            const response = await fetch('/api/livepeer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompts, userAstroData }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate images')
            }

            const data = await response.json()

            const combinedImages = [
                ...(data.images1 || []).map(img => img.url),
                ...(data.images2 || []).map(img => img.url),
                ...(data.images3 || []).map(img => img.url),
                ...(data.images4 || []).map(img => img.url),
            ]

            setImageResponses(combinedImages) // Guardar todas las imágenes
        } catch (error) {
            console.error('Error generating images:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateNFT = async imageUrl => {
        setImageIsLoading(true)
        try {
            const response = await fetch('/api/create-nft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl, userAstroData }),
            })

            if (!response.ok) {
                throw new Error('Failed to create NFT')
            }

            const nftData = await response.json()
            setImageIsLoading(false)
            setNftData(nftData) // Almacenar los datos del NFT en el estado
            setModalIsOpen(true) // Abrir el modal con los detalles del NFT
        } catch (error) {
            console.error('Error creating NFT:', error)
        }
    }

    const closeModal = () => {
        setModalIsOpen(false)
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Generate and Mint Your Zodiac NFT
            </h1>
            <p className="text-lg text-gray-600 text-center mb-6">
                Get ready to discover four unique and stunning representations
                of your zodiac sign, each crafted with cosmic precision. Choose
                the one that resonates with your astral identity and mint it as
                an NFT on Story Protocol. Explore the stars, planets, and
                ancient symbolism intertwined with your zodiac essence in every
                image. Once generated, select your favorite to immortalize it on
                the blockchain!
            </p>
            <button
                onClick={handleGenerateImage}
                disabled={isLoading || prompts.length === 0}
                className="w-full max-w-sm py-4 px-6 mt-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300">
                {isLoading ? 'Generating...' : 'Generate Images'}
            </button>

            {imageResponses.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {imageResponses.map((imageResponse, index) => (
                        <div
                            key={index}
                            className="relative bg-white shadow-xl rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-500">
                            <img
                                src={imageResponse}
                                alt={`Generated Astral NFT ${index + 1}`}
                                className="w-full h-auto"
                            />
                            <button
                                onClick={() => handleCreateNFT(imageResponse)}
                                className="absolute bottom-4 right-4 py-2 px-4 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transform hover:scale-110 transition-all duration-300"
                                disabled={imageIsLoading}>
                                Create NFT
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {/* Spinner mientras se carga la imagen */}
            {imageIsLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                </div>
            )}

            {/* Modal to display NFT details */}
            {nftData && (
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="fixed inset-0 z-50 grid place-items-center p-8 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 pt-8 max-w-4xl w-full mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            NFT Details
                        </h2>
                        <img
                            src={nftData.imageUrl}
                            alt="Generated NFT"
                            className="w-full h-auto rounded-md shadow-md mb-4"
                        />
                        <p className="text-lg text-gray-700 break-all text-center">
                            <strong>Transaction Hash</strong> <br></br>
                            {nftData.transactionHash}
                        </p>
                        <br></br>
                        <p className="text-lg text-gray-700 break-all text-center">
                            <strong>IP ID</strong> <br></br>
                            {nftData.ipId}
                        </p>
                        <br></br>
                        <p className="text-lg text-gray-700 break-all text-center">
                            <strong>IP Metadata URI</strong>
                            <br></br>
                            <a
                                href={nftData.ipMetadataUri}
                                className="text-blue-600 hover:underline break-all"
                                target="_blank">
                                {nftData.ipMetadataUri}
                            </a>
                        </p>
                        <br></br>
                        <p className="text-lg text-gray-700 break-all text-center">
                            <strong>NFT Metadata URI</strong>
                            <br></br>
                            <a
                                href={nftData.nftMetadataUri}
                                className="text-blue-600 hover:underline"
                                target="_blank">
                                {nftData.nftMetadataUri}
                            </a>
                        </p>
                        <br></br>
                        <p className="text-lg text-gray-700 break-all text-center">
                            <strong>Explorer Link:</strong>
                            <br></br>
                            <a
                                href={nftData.explorerUrl}
                                className="text-blue-600 hover:underline"
                                target="_blank">
                                View on Explorer
                            </a>
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={closeModal}
                                className="mt-6 py-2 px-4 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-all duration-300 flex justify-center">
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
