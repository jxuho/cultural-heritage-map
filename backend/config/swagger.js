const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = YAML.load(
  path.join(__dirname, '../public/openapi.yaml'),
);

module.exports = {
  swaggerUi,
  swaggerDocument,
};
