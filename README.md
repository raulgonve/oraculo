# Oracle AI

Oracle AI is an innovative astrology platform that combines advanced technologies to deliver a personalized, engaging, and immersive astrological experience. Users can generate their natal (astral) chart, explore detailed interpretations, receive daily horoscopes, chat with an AI astrology expert, and even create NFTs from astrology-based images and videos.


https://github.com/user-attachments/assets/567e186c-757b-423e-a452-c4b65d7b1bf8



## Project Overview

Oracle AI focuses on generating users’ astral charts, providing a thorough breakdown of each astrological element, aspect, and advanced feature of their chart. The platform also offers daily horoscope generation and the ability to chat with "Astrobot," an AI-powered expert in astrology. Users can interact with Astrobot to ask questions, get astrological insights, and even generate images from their conversations. Moreover, Oracle AI integrates blockchain technology to allow users to turn their personalized astrology-based images and videos into NFTs.

### Modules

- **Dashboard**: A summary view of the user's natal chart with key astrological elements.
- **Astral Chart**: Allows users to generate their complete astral chart, and it provides an audio summary of the chart.
- **Astrobot**: An AI-powered expert in astrology that can chat with users, answer their astrological questions, and generate related images based on their conversations.
- **Horoscope**: A section where users can generate their daily horoscope based on their natal chart.
- **Astral NFT**: Users can generate images based on their zodiac sign and register the NFT as an IP Asset using Livepeer for image generation and Story Protocol for the NFT process.
- **Zora**: Users can create ERC-1155 contracts and mint tokens. Livepeer is used to generate images, which are turned into videos, then the token is minted on the Zora blockchain.
- **SwarmZero**: We successfully implemented the Livepeer YouTube Video Generator with SwarmZero, following the process of generating and uploading videos to YouTube using AI agents and decentralized networks. By leveraging Livepeer’s decentralized video platform, these agents collaborate to create and manage videos without manual intervention, with results displayed in the SwarmZero section. This allows for exploring automated and decentralized solutions for media content creation and distribution.

### Hackathon Features

For this hackathon, we’re showcasing several cutting-edge integrations:

- **Livepeer & Story Protocol**: In the Astral NFT section, users can generate images based on their zodiac signs and mint them as NFTs. These images are displayed in the UI and can be shared or turned into NFTs using Story Protocol’s blockchain.
- **Zora & ERC-1155 Tokens**: Users can create an ERC-1155 contract and mint tokens. Images are first generated by Livepeer, then converted into videos, which are subsequently minted as tokens on the Zora network.
- **SwarmZero Integration**: We effectively integrated the Livepeer YouTube Video Generator with SwarmZero, utilizing AI agents and decentralized networks to automate the creation and upload of videos to YouTube.  

### How to Run the Project

#### Requirements:
- PHP 8 or higher
- MySQL database
- Node.js 18 or higher
- OpenAI API key
- Huggingface API key
- Livepeer API key
- SwarmZero API key
- Zora SDK

#### Steps to Execute:

1. Clone the project repository:
   ```bash
   git clone https://github.com/raulgonve/oraculo.git
    ```

2. Backend (Laravel):
   - Navigate to the project root and run:
   ```bash
   composer install
   ```
   - Copy .env.example to .env and fill in the database connection details.
   - Run the migrations and seed the database:
   ```bash
   php artisan migrate --seed
   ```
   - Start the Laravel backend server:
   ```bash
   php artisan serve
   ```

3. Frontend (Next.js):
   - Navigate to the `breeze-next` folder:
   ```bash
   cd breeze-next
   ```
   - Copy .env.example to .env and complete the required information.
   - Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Project Members
   - Esteban Valsecchi - Developer
   - Raul Gonzalez - Developer

### Contact Information
   - Discord Users:
     - @cryptobull13
     - @cryptowolf

## Screenshots

Here are some screenshots of the main modules of Oracle AI:

- **Dashboard**: Summary view of the user's astral chart.
<img width="1508" alt="dash" src="https://github.com/user-attachments/assets/1c817bf0-7a93-441a-adda-0845fd9baf82">

- **Astral Chart**: The user's complete astral chart with an audio summary.
  ![Astral Chart](public/assets/screenshots/astralchart.png)

- **Astrobot**: Chat with the AI-powered astrology expert.
  ![Astrobot](public/assets/screenshots/astrobot.png)

- **Horoscope**: Daily horoscope generation based on the user's natal chart.
  ![Horoscope](public/assets/screenshots/horoscope.png)

- **Astral NFT**: Generate and Register the NFT as an IP Asset with Livepeer and StoryProtocol.
  ![Astral NFT](public/assets/screenshots/nft.png)
  <img width="1507" alt="sp1" src="https://github.com/user-attachments/assets/7c23aff2-f2a1-4ba8-85fd-79f47f1ea96e">
  <img width="1496" alt="sp2" src="https://github.com/user-attachments/assets/4774cb86-8d41-4ea6-a4db-b9c67411082e">
  <img width="1499" alt="sp3" src="https://github.com/user-attachments/assets/a5c00592-85d5-4c55-9c78-7d9a40fbb117">
    https://explorer.story.foundation/ipa/0x60B038ECE510fcc1BB0c1a33603d330f20fFe38B

  

- **Zora**: Create ERC-1155 contracts, mint tokens, and generate videos using Livepeer.
  ![Zora](public/assets/screenshots/zora.png)
  https://zora.co/collect/zora:0xffb9f928724e2578d8b56b0f9dae34dc65a707e5/1

- **SwarmZero**: Generate images and videos and upload them directly to YouTube using SwarmZero.
  ![SwarmZero](public/assets/screenshots/swarmzero.png)
  https://www.youtube.com/watch?v=TIpPNsCQtK0