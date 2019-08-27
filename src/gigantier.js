import 'fetch-everywhere';
import 'es6-promise';

import configFactory from './config';
import clientFactory from './factories/client';

const gigantier = (options) => {
  const config = configFactory(options);
  const client = clientFactory(config);

  return {
    call: client.call,
    authenticatedCall: client.authenticatedCall,
    authenticate: client.authenticate
  };
};

export default gigantier;

const client = (config) => gigantier(config);
export { client };
