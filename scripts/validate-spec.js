const fs = require('fs');
const Enforcer = require('openapi-enforcer');
const yaml = require('js-yaml');

var doc = yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));

Enforcer(doc, { fullResult: true })
  .then(function({ error, warning }) {
    if (!error) {
      console.log('OpenAPI Specification is valid.');
      if (warning) console.warn(warning);
      return process.exit(0);
    } else {
      console.error(error);
      return process.exit(1);
    }
  })
  .catch(error => {
    console.error('INVALID OPENAPI SPECIFICATION:', error);
    return process.exit(1);
  });
