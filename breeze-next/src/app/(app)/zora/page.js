'use client'
import { useState } from 'react'
import Create1155Contract from '../../../components/nft/Create1155Contract'
import MintToken from '../../../components/nft/MintToken'

function ZoraPage() {
    const [contractAddress, setContractAddress] = useState('')
    const [metadata, setMetadata] = useState('')
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState('')
    const [isMintingReady, setIsMintingReady] = useState(false)
    const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [showMintToken, setShowMintToken] = useState(false) // Estado para mostrar el componente MintToken

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

    const handleCreateContract = () => {
        setIsMintingReady(true)
        setErrorMessage(null) // Limpiar error antes de intentar crear un nuevo contrato
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
        // Solo mostrar el componente MintToken si la transacción fue confirmada y hay una contractAddress
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
                                then mint it on the blockchain!
                            </p>

                            {/* Subir archivo multimedia */}
                            <div className="w-full max-w-sm">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Upload Media File:
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {filePreview && (
                                    <div className="mt-4">
                                        <p className="text-gray-700 mb-2">
                                            File Preview:
                                        </p>
                                        <img
                                            src={filePreview}
                                            alt="File preview"
                                            className="w-full h-auto rounded-md shadow-md"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Input para la metadata */}
                            <div className="w-full max-w-sm mt-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Enter Metadata:
                                </label>
                                <textarea
                                    value={metadata}
                                    onChange={e => setMetadata(e.target.value)}
                                    placeholder="Enter metadata in JSON format"
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Botón para crear contrato */}
                            <div className="w-full max-w-sm mt-6">
                                <button
                                    onClick={handleCreateContract}
                                    className="w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-md font-semibold shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300">
                                    Create Contract
                                </button>
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
