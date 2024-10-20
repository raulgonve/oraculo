'use client'
import { useState } from 'react'
import Create1155Contract from '../../../components/nft/Create1155Contract'
import MintToken from '../../../components/nft/MintToken'

function ZoraPage() {
    const [contractAddress, setContractAddress] = useState('')
    const [metadata, setMetadata] = useState('')
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState('')
    const [name, setName] = useState('') // Estado para el nombre
    const [description, setDescription] = useState('') // Estado para la descripción
    const [isMintingReady, setIsMintingReady] = useState(false)
    const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [showMintToken, setShowMintToken] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false) // Estado para generar imagen o animación
    const [generatedImage, setGeneratedImage] = useState(null) // Imagen generada
    const [generatedVideo, setGeneratedVideo] = useState(null) // Video generado

    // Obtener los datos del usuario y su signo solar
    const fetchUserAstroData = async () => {
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
                if (data.sun) {
                    return {
                        sun: data.sun, // Retorna solo el signo solar
                    }
                } else {
                    setErrorMessage('Unable to fetch sun sign.')
                    return null
                }
            } else {
                setErrorMessage('Failed to fetch user data.')
                return null
            }
        } catch (error) {
            setErrorMessage('Error fetching user data.')
            return null
        }
    }

    // Llamar a la API para generar la animación según el signo solar del usuario
    // Manejar el archivo multimedia y previsualizarlo
    const handleFileChange = event => {
        const selectedFile = event.target.files[0]
        setFile(selectedFile)
        const reader = new FileReader()
        reader.onload = () => {
            setFilePreview(reader.result)
        }
        reader.readAsDataURL(selectedFile)
    }

    const handleGenerateAnimation = async () => {
        setIsGenerating(true)
        setErrorMessage(null)

        try {
            // Obtener los datos astrológicos del usuario primero
            const astroData = await fetchUserAstroData()

            if (!astroData?.sun) {
                setErrorMessage('Sun sign not available.')
                setIsGenerating(false)
                return
            }

            // Llamada a la API para generar la animación
            const response = await fetch('/api/create-animation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sunSign: astroData.sun,
                }),
            })

            if (response.ok) {
                const { videoUrl, imageUrl } = await response.json()
                setGeneratedVideo(videoUrl) // Almacenar el video generado
                setGeneratedImage(imageUrl) // Almacenar la imagen generada
            } else {
                setErrorMessage('Failed to generate animation.')
            }
        } catch (error) {
            setErrorMessage('Error generating animation.')
        } finally {
            setIsGenerating(false)
        }
    }
    const handleCreateContract = () => {
        setIsMintingReady(true)
        setErrorMessage(null)
    }

    const handleContractCreated = address => {
        setContractAddress(address)
        setIsMintingReady(true)
    }

    const handleTransactionConfirmed = () => {
        setIsTransactionConfirmed(true)
    }

    const handleTransactionError = error => {
        setErrorMessage(`Transaction failed: ${error}`)
    }

    const handleMintTokenClick = () => {
        if (isTransactionConfirmed && contractAddress) {
            setShowMintToken(true)
        } else {
            setErrorMessage(
                'Transaction not confirmed or contract address is missing.',
            )
        }
    }

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex flex-col items-center">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                Create and Mint Your ERC-1155 Token
                            </h1>
                            <p className="text-lg text-gray-600 text-center mb-6">
                                Upload a file and metadata to create your token,
                                then mint it on Zora!
                            </p>

                            {/* Cuadro para subir o generar imagen */}
                            <div className="flex flex-col items-center w-full">
                                <div className="max-w-lg w-full bg-white shadow-lg p-6 rounded-lg">
                                    {/* Nombre */}
                                    <div className="mb-6">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e =>
                                                setName(e.target.value)
                                            }
                                            placeholder="name..."
                                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div className="mb-6">
                                        <textarea
                                            value={description}
                                            onChange={e =>
                                                setDescription(e.target.value)
                                            }
                                            placeholder="description..."
                                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Cuadro para subir o generar imagen */}
                                    <div className="mb-6">
                                        <div
                                            className="relative border-2 border-dashed border-gray-300 rounded-lg text-center"
                                            style={{
                                                height: generatedVideo
                                                    ? 'auto'
                                                    : '300px', // Ajusta el alto automáticamente si hay video
                                                width: '100%',
                                            }}>
                                            {/* Vista previa de la imagen o video generados */}
                                            {generatedVideo ? (
                                                <video
                                                    src={generatedVideo}
                                                    controls
                                                    className="w-full h-auto rounded-md"
                                                    style={{ zIndex: 10 }} // Elevar el video en el z-index
                                                />
                                            ) : generatedImage ? (
                                                <img
                                                    src={generatedImage}
                                                    alt="Preview"
                                                    className="w-full h-auto mb-4 rounded-md"
                                                />
                                            ) : filePreview ? (
                                                <img
                                                    src={filePreview}
                                                    alt="Preview"
                                                    className="w-full h-auto mb-4 rounded-md"
                                                />
                                            ) : (
                                                <div>
                                                    <p className="text-gray-600">
                                                        Drag & drop or click to
                                                    </p>
                                                    <strong>
                                                        Upload Image
                                                    </strong>
                                                    <p className="text-gray-400">
                                                        minimum 1024x1024 .jpg,
                                                        .png, .gif, mp4
                                                    </p>
                                                </div>
                                            )}

                                            {/* Input para subir archivo: Mostrar solo si no hay video */}
                                            {!generatedVideo && (
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            )}

                                            {/* Botón para generar animación, centrado visualmente */}
                                            <div className="absolute inset-x-0 bottom-6 flex justify-center">
                                                <button
                                                    onClick={
                                                        handleGenerateAnimation
                                                    }
                                                    className="py-2 px-4 bg-white text-gray-800 shadow-md rounded-md transition-transform transform hover:scale-105 focus:outline-none"
                                                    disabled={isGenerating}>
                                                    {isGenerating
                                                        ? 'Generating...'
                                                        : 'Generate Animation'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mostrar mensaje de error si ocurre */}
                                    {errorMessage && (
                                        <div className="mt-6 text-red-600">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Botón para crear contrato */}
                                    <div className="w-full mt-6 flex justify-center">
                                        <button
                                            onClick={handleCreateContract}
                                            className="py-3 px-6 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300">
                                            Create Contract
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Componente para crear contrato */}
                            {isMintingReady && (
                                <div className="w-full max-w-sm mt-6">
                                    <Create1155Contract
                                        onContractCreated={
                                            handleContractCreated
                                        }
                                        onTransactionConfirmed={
                                            handleTransactionConfirmed
                                        }
                                        onTransactionError={
                                            handleTransactionError
                                        }
                                    />
                                </div>
                            )}

                            {/* Mostrar mensaje de error si ocurre */}
                            {errorMessage && (
                                <div className="mt-6 text-red-600">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Botón para mintear el token */}
                            {isTransactionConfirmed && contractAddress && (
                                <div className="w-full max-w-sm mt-6">
                                    <button
                                        onClick={handleMintTokenClick}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300">
                                        Mint Token
                                    </button>
                                </div>
                            )}

                            {/* Mostrar el componente MintToken si se cumple la condición */}
                            {showMintToken && (
                                <div className="w-full max-w-sm mt-6">
                                    <MintToken
                                        contractAddress={contractAddress}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ZoraPage
