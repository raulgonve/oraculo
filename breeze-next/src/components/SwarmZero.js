'use client'
import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { FaYoutube, FaTwitter } from 'react-icons/fa'

// Import Swiper modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

// Image and video paths for the Swiper slides
const imagePaths = [
    '/images/leo_constellation.png',
    '/images/leo_crown_of_flames.png',
    '/images/leo_mane_to_sunlight.png',
    '/images/leo_orbs_gifts.png',
    '/images/scene_1_opening.png',
    '/images/scene_2_introduction.png',
]

const videoPaths = [
    '/videos/2eb48bfe.mp4',
    '/videos/8a6f03ea.mp4',
    '/videos/bad607f3.mp4',
    '/videos/cccb7a7e.mp4',
    '/videos/eb96a1f0.mp4',
    '/videos/f20fd203.mp4',
]

export default function SwarmZero() {
    const [hoveredVideo, setHoveredVideo] = useState(null) // State to track which video is being hovered

    return (
        <div className="flex flex-col items-center p-8 w-[90%] max-w-5xl mx-auto">
            {/* Header for the generated YouTube video section */}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
                YouTube Video Generated Automatically Using SwarmZero and
                Livepeer
            </h2>
            <p className="text-md text-center text-gray-600 mb-6">
                This video was automatically created and uploaded using
                SwarmZero and Livepeer, showcasing the power of artificial
                intelligence and decentralized networks. Without manual
                intervention, a swarm of AI agents collaborated to manage the
                entire process, from content generation to publishing on
                YouTube. Thanks to Livepeer's decentralized video platform and
                SwarmZero technology, this video exemplifies how automation and
                decentralized networks are revolutionizing content production
                and distribution across multiple platforms.
            </p>

            {/* Image carousel */}
            <div className="w-full max-w-3xl mx-auto mb-10">
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Generated Images
                </h3>
                <Swiper
                    spaceBetween={20}
                    slidesPerView={4}
                    autoplay={{ delay: 3000 }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}>
                    {/* Loop through the image paths and display each image in a Swiper slide */}
                    {imagePaths.map((src, index) => (
                        <SwiperSlide key={index}>
                            <div className="flex-shrink-0 w-full h-56 overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={src}
                                    alt={`Generated Image ${index}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Video carousel */}
            <div className="w-full max-w-5xl mx-auto mb-10">
                <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Generated Videos
                </h3>
                <Swiper
                    spaceBetween={30}
                    slidesPerView={3}
                    autoplay={{ delay: 4000 }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}>
                    {/* Loop through the video paths and display each video in a Swiper slide */}
                    {videoPaths.map((src, index) => (
                        <SwiperSlide key={index}>
                            <div
                                className="flex-shrink-0 w-[300px] h-[170px] overflow-hidden rounded-lg shadow-lg"
                                onMouseEnter={() => setHoveredVideo(index)}
                                onMouseLeave={() => setHoveredVideo(null)}>
                                <video
                                    src={src}
                                    muted
                                    loop
                                    className="w-full h-full object-cover"
                                    autoPlay={hoveredVideo === index} // Play the video on hover
                                    controls={hoveredVideo === index} // Show controls on hover
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Header for the final YouTube video */}
            <div className="w-full max-w-5xl mx-auto mb-10 mt-10">
                <h2 className="text-4xl font-semibold text-center text-gray-800 mb-4">
                    Final Video
                </h2>
            </div>

            {/* Embedded YouTube video */}
            <div className="w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden bg-white transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="relative pb-[177%]">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/TIpPNsCQtK0"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
                </div>
            </div>

            {/* Buttons for sharing the video on YouTube and Twitter */}
            <div className="flex justify-center items-center space-x-6 mt-6">
                {/* Button to watch the video on YouTube */}
                <a
                    href="https://www.youtube.com/watch?v=TIpPNsCQtK0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 py-2 px-6 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out">
                    <FaYoutube className="text-xl" /> {/* YouTube icon */}
                    <span>Watch on YouTube</span>
                </a>

                {/* Button to share the video on X (formerly Twitter) */}
                <a
                    href={`https://twitter.com/intent/tweet?url=https://www.youtube.com/watch?v=TIpPNsCQtK0&text=Check%20out%20this%20AI-generated%20video%20using%20SwarmZero%20and%20Livepeer!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 py-2 px-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 shadow-md transform hover:scale-110 hover:shadow-xl transition-all duration-500 ease-in-out ">
                    <FaTwitter className="text-xl" /> {/* X (Twitter) icon */}
                    <span>Share on X</span>
                </a>
            </div>
        </div>
    )
}
