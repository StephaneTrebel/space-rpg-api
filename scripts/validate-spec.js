const fs = require('fs');
const Enforcer = require('openapi-enforcer');
const yaml = require('js-yaml');

var doc = yaml.safeLoad(fs.readFileSync('src/openapi.yaml', 'utf8'));

return Enforcer(doc, { fullResult: true }).then(function({ error, warning }) {
  if (!error) {
    console.log('No errors with your document');
    if (warning) console.warn(warning);
    return process.exit(0);
  } else {
    console.error(error);
    return process.exit(1);
  }
});
