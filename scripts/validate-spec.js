const fs = require('fs')
const Enforcer = require('openapi-enforcer')
const yaml = require('js-yaml')

var doc = yaml.safeLoad(fs.readFileSync('openapi.yaml', 'utf8'));

Enforcer(doc, { fullResult: true })
    .then(function ({ error, warning }) {
        if (!error) {
            console.log('No errors with your document')
            if (warning) console.warn(warning)
        } else {
            console.error(error)
            process.exit(1)
        }
    })
