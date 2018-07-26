import { version } from '../package.json';

const config = ({ application, clientId, clientSecret, host, scope, protocol, apiVersion, retries }) => ({
  application,
  clientId,
  clientSecret,
  host: host || 'api.gigantier.com',
  protocol: protocol || 'https',
  version: apiVersion || 'v1',
  scope,
  retries: retries || 1,
  auth: {
    expires: 3600,
    uri: '/OAuth/token'
  },
  sdk: {
    version,
    language: 'JS'
  }
});

export default config;
