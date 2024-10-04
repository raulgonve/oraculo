const path = require('path')

const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('swisseph-v2')
        }

        config.module.rules.push({
            test: /\.node$/,
            use: 'node-loader',
        })

        config.resolve.alias['@'] = path.resolve(__dirname, 'src')
        return config
    },
}

module.exports = nextConfig
