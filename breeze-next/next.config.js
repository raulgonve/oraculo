const path = require('path')

module.exports = {
    webpack: config => {
        // Configura el alias `@` para que apunte al directorio `src`
        config.resolve.alias['@'] = path.resolve(__dirname, 'src')
        return config
    },
}
