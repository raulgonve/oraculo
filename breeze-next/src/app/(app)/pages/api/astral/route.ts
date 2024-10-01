import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { birthDate, birthTime, birthPlace } = req.body

        // Aquí podrías realizar los cálculos astrológicos.
        // Por ejemplo, usando alguna librería de astrología.

        res.status(200).json({ message: 'Astrological data generated!' })
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
