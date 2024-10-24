'use client'
import { useState } from 'react'
import Create1155Contract from '../../../components/zora/Create1155Contract'
import MintToken from '../../../components/zora/MintToken'

function ZoraPage() {
    const [contractAddress, setContractAddress] = useState('') // Contract address after creation
    const [metadata, setMetadata] = useState('') // Metadata for the token
    const [file, setFile] = useState(null) // File for uploading
    const [filePreview, setFilePreview] = useState('') // File preview before uploading
    const [name, setName] = useState('') // State for contract name
    const [description, setDescription] = useState('') // State for contract description
    const [isMintingReady, setIsMintingReady] = useState(false) // Check if minting is ready
    const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false) // Confirm if transaction succeeded
    const [errorMessage, setErrorMessage] = useState(null) // Store error messages
    const [showMintToken, setShowMintToken] = useState(false) // Show MintToken component
    const [isGenerating, setIsGenerating] = useState(false) // State to manage loading during image or animation generation
    const [generatedImage, setGeneratedImage] = useState(null) // Store the generated image
    const [generatedVideo, setGeneratedVideo] = useState(null) // Store the generated video
    const [isCreatingContract, setIsCreatingContract] = useState(false) // State for contract creation loading
    const [txHash, setTxHash] = useState(null) // Store transaction hash for explorer link

    // Fetch user astrological data and their sun sign
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
                        sun: data.sun, // Return only the sun sign
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

    // Handle file selection and display a preview
    const handleFileChange = event => {
        const selectedFile = event.target.files[0]
        setFile(selectedFile)
        const reader = new FileReader()
        reader.onload = () => {
            setFilePreview(reader.result)
        }
        reader.readAsDataURL(selectedFile)
    }

    // Generate animation based on the user's sun sign
    const handleGenerateAnimation = async () => {
        setIsGenerating(true)
        setErrorMessage(null)

        try {
            // First, fetch user astrological data
            const astroData = await fetchUserAstroData()

            if (!astroData?.sun) {
                setErrorMessage('Sun sign not available.')
                setIsGenerating(false)
                return
            }

            // API call to generate the animation
            const response = await fetch('/api/livepeer-image-to-video', {
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
                setGeneratedVideo(videoUrl) // Store the generated video
                setGeneratedImage(imageUrl) // Store the generated image
            } else {
                setErrorMessage('Failed to generate animation.')
            }
        } catch (error) {
            setErrorMessage('Error generating animation.')
        } finally {
            setIsGenerating(false)
        }
    }

    // Set the contract ready to be minted
    const handleCreateContract = () => {
        if (!name || !description || (!filePreview && !generatedImage)) {
            setErrorMessage(
                'Name, description, and image must be provided to create a contract.',
            )
            return
        }

        // Set as minting ready only when data is complete
        setIsMintingReady(true)
        setErrorMessage(null)
    }

    // Store the contract address after contract creation
    const handleContractCreated = (address, txHash) => {
        if (address) {
            setContractAddress(address)
            setIsMintingReady(true)
            setTxHash(txHash) // Store transaction hash for explorer link
        } else {
            setErrorMessage('Failed to create contract. Please try again.')
        }
        setIsCreatingContract(false) // Set loading to false after contract creation
    }

    // Confirm that the transaction was successful
    const handleTransactionConfirmed = () => {
        setIsTransactionConfirmed(true)
    }

    // Handle transaction error
    const handleTransactionError = error => {
        setErrorMessage(`Transaction failed: ${error}`)
        setIsCreatingContract(false) // Stop loading on error
    }

    // Check if the token can be minted
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

                            {/* Upload or generate image box */}
                            <div className="flex flex-col items-center w-full">
                                <div className="max-w-lg w-full bg-white shadow-lg p-6 rounded-lg">
                                    {/* Name input */}
                                    <div className="mb-6">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e =>
                                                setName(e.target.value)
                                            }
                                            placeholder="name..."
                                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Description input */}
                                    <div className="mb-6">
                                        <textarea
                                            value={description}
                                            onChange={e =>
                                                setDescription(e.target.value)
                                            }
                                            placeholder="description..."
                                            className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* File upload or generated image/video preview */}
                                    <div className="mb-6">
                                        <div
                                            className="relative border-2 border-dashed border-gray-300 rounded-lg text-center"
                                            style={{
                                                height:
                                                    generatedVideo ||
                                                    generatedImage ||
                                                    filePreview
                                                        ? 'auto'
                                                        : '300px', // Ajusta la altura automáticamente si se genera un video o imagen
                                                width: '100%',
                                            }}>
                                            {/* Preview del video generado o la imagen */}
                                            {generatedVideo ? (
                                                <video
                                                    src={generatedVideo}
                                                    controls
                                                    className="w-full h-auto rounded-md"
                                                    style={{ zIndex: 10 }} // Coloca el video al frente
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

                                            {/* File input si no se ha generado un video */}
                                            {!generatedVideo && (
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            )}

                                            {/* Botón para generar animación, oculto si ya se ha generado el video */}
                                            {!generatedVideo && (
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
                                            )}
                                        </div>
                                    </div>

                                    {/* Display error message if any */}
                                    {errorMessage && (
                                        <div className="mt-6 text-red-600">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Button to create contract */}
                                    <div className="w-full mt-6 flex justify-center">
                                        <button
                                            onClick={() => {
                                                setIsCreatingContract(true)
                                                handleCreateContract()
                                            }}
                                            className="py-3 px-6 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300">
                                            {isCreatingContract
                                                ? 'Creating Contract...'
                                                : 'Create Contract'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isMintingReady && !contractAddress && (
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
                                        contractName={name} // Pass contract name
                                        contractDescription={description} // Pass contract description
                                        contractImageUrl={
                                            filePreview || generatedImage
                                        } // Pass file or generated image URL
                                        contractVideoUrl={generatedVideo} // Pass generated video URL
                                    />
                                </div>
                            )}

                            {/* Show contract details once it's created */}
                            {contractAddress && (
                                <div className="mt-6 text-gray-800">
                                    <p>
                                        Contract Address:{' '}
                                        <span className="text-blue-500">
                                            {contractAddress}
                                        </span>
                                    </p>
                                    {txHash && (
                                        <p>
                                            Transaction Explorer:{' '}
                                            <a
                                                href={`https://explorer.zora.energy/tx/${txHash}`} // Adjust the explorer link as per your network
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline">
                                                View on Explorer
                                            </a>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Display error message if any */}
                            {errorMessage && (
                                <div className="mt-6 text-red-600">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Button to mint token after transaction confirmation */}
                            {isTransactionConfirmed && contractAddress && (
                                <div className="w-full max-w-sm mt-6">
                                    <button
                                        onClick={handleMintTokenClick}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300">
                                        Mint Token
                                    </button>
                                </div>
                            )}

                            {/* Show MintToken component if conditions are met */}
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
