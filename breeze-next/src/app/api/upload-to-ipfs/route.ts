import { NextResponse } from 'next/server'
import { uploadJSONToIPFS } from '../../utils/uploadToIpfs'

export async function POST(req) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const { contractName, contractDescription, contractImageUrl, contractVideoUrl } = await req.json()

    // Crear los metadatos del contrato a subir a IPFS
    const contractJSON = {
      name: contractName,
      description: contractDescription,
      image: contractImageUrl,
    }

    const tokenJSON = {
      name: `Token NFT for ${contractName}`,
      description: `Token NFT for ${contractName}`,
      image: contractImageUrl,
      animation_url: contractVideoUrl,
      content: {
        mime: 'video/mp4',
        uri: contractVideoUrl,
      },
      attributes: {
        trait_type: 'Contract',
        value: contractName,
      },
      thumbnailUrl: contractImageUrl,
      mediaUrl: contractVideoUrl,
    }

    // Subir los metadatos del contrato y token a IPFS
    const contractMetadataHash = await uploadJSONToIPFS(contractJSON)
    const tokenMetadataHash = await uploadJSONToIPFS(tokenJSON)

    // Retornar los hashes de los metadatos subidos
    return new NextResponse(
      JSON.stringify({
        contractMetadataUri: `https://ipfs.io/ipfs/${contractMetadataHash}`,
        tokenMetadataUri: `https://ipfs.io/ipfs/${tokenMetadataHash}`,
      }),
      { status: 200 }
    )

  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to upload metadata to IPFS' }),
      { status: 500 }
    )
  }
}
