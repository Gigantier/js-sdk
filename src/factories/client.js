import storageFactory from './storage';
import debug from 'debug';

const storage = storageFactory();
const validate = (field, msg) => {
  if (!field) throw new Error(msg);
};

const client = (config) => {
  validate(config.clientId, 'Missing clientId in config');
  validate(config.clientSecret, 'Missing clientSecret in config');
  validate(config.host, 'Missing API Host in config');
  validate(config.scope, 'Missing Scope in config');

  // Private

  const appCredentialsKey = 'appCredentials';
  const userCredentialsKey = 'userCredentials';

  const parseJSON = (response) => {
    try {
      return response.json().then((json) => ({ status: response.status, ok: response.ok, json }));
    } catch (e) {
      throw new Error('Cannot parse api response', e);
    }
  };

  const buildHeaders = () => {
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-GIGANTIER-SDK-LANGUAGE': config.sdk.language,
      'X-GIGANTIER-SDK-VERSION': config.sdk.version
    };

    if (config.application) {
      headers['X-GIGANTIER-APPLICATION'] = config.application;
    }

    return headers;
  };

  const buildUrl = (uri) => {
    const versionPath = config.version && config.version != '' ? `/${config.version}` : '';
    return `${config.protocol}://${config.host}/api${versionPath}${uri}`;
  };

  const encodeBody = (body) => {
    let formBody = [];
    for (let property in body) {
      if (body.hasOwnProperty(property)) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(body[property]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
    }
    return formBody.join('&');
  };

  const renewAppCredentials = (appCredentials) => {
    return !appCredentials ||
      !appCredentials.accessToken ||
      appCredentials.clientId !== config.clientId ||
      Math.floor(Date.now() / 1000) >= appCredentials.expires;
  };

  const renewUserCredentials = (userCredentials) => {
    return !userCredentials ||
      !userCredentials.accessToken ||
      userCredentials.clientId !== config.clientId ||
      Math.floor(Date.now() / 1000) >= userCredentials.expires;
  };

  const getAppToken = (renew = false) => {
    const appCredentials = JSON.parse(storage.get(appCredentialsKey));

    if (renew || renewAppCredentials(appCredentials)) {
      return tokenFunc(appCredentialsKey, 'client_credentials').then((result) => result.accessToken);
    } else {
      return Promise.resolve(appCredentials.accessToken);
    }
  };

  const getUserToken = (renew = false) => {
    const userCredentials = JSON.parse(storage.get(userCredentialsKey));

    if (!userCredentials) throw new Error('Invalid user credentials. Need to call authenticate() first.');
    else if (renew || renewUserCredentials(userCredentials)) {
      const refreshBody = { 'refresh_token': userCredentials.refreshToken };
      return tokenFunc(userCredentialsKey, 'refresh_token', refreshBody).then((result) => result.accessToken);
    } else {
      return Promise.resolve(userCredentials.accessToken);
    }
  };

  const execMethod = (requestToken, method, uri, body = null, isUserApi, resolve, reject, retries = config.retries) => {
    let onResult = (response) => {
      if (response.ok) resolve(response.json);
      else if (response.status == 401 && retries > 0) {
        (isUserApi ? getUserToken(true) : getAppToken(true)).then((token) => {
          return execMethod(token, method, uri, body, isUserApi, resolve, reject, retries - 1);
        });
      } else reject(response.json);
    };

    let fetchUrl = buildUrl(uri);
    let fetchData = {
      method: method,
      headers: buildHeaders()
    };

    if (body != null) {
      const fullBody = Object.assign(body, { 'access_token': requestToken });
      fetchData = Object.assign(fetchData, { body: encodeBody(fullBody) });
    } else {
      fetchUrl += ((fetchUrl.indexOf('?') > 0) ? '&' : '?' ) + 'access_token=' + requestToken;
    }

    fetch(fetchUrl, fetchData).then(parseJSON).then(onResult).catch(reject);
  };

  const callFunc = (uri, { method = 'POST', body = {} } = {}) => {
    debug(`${method} request to ${uri} with body ${body}`);

    return new Promise((resolve, reject) => {
      getAppToken().then((token) => {
        execMethod(token, method, uri, body, false, resolve, reject);
      }).catch(reject);
    });
  };

  const authenticatedCallFunc = (uri, { method = 'POST', body = {} } = {}) => {
    debug(`Authenticated ${method} request to ${uri} with body ${body}`);

      return new Promise((resolve, reject) => {
        if (body.access_token) {
          execMethod(body.access_token, method, uri, body, true, resolve, reject);
        } else {
          getUserToken().then((token) => {
            execMethod(token, method, uri, body, true, resolve, reject);
          }).catch(reject);
        }
      });
  };

  const tokenFunc = (key, grantType, additionalParams = {}) => {
    debug('Token request with grant type: %s', grantType);

    const promise = new Promise((resolve, reject) => {
      const body = {
        'grant_type': grantType,
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'scope': config.scope
      };

      const fullBody = Object.assign(body, additionalParams);

      fetch(buildUrl(config.auth.uri), {
        method: 'POST',
        headers: buildHeaders(),
        body: encodeBody(fullBody)
      })
        .then(parseJSON)
        .then((response) => (response.ok) ? resolve(response.json) : reject(response.json))
        .catch((error) => reject(error));
    });

    return promise.then((response) => {
      const credentials = {
        clientId: config.clientId,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expires: Math.floor(Date.now() / 1000) + response.expires_in
      };
      storage.set(key, JSON.stringify(credentials));
      return credentials;
    });
  };

  const authenticateFunc = (email, password) => tokenFunc(userCredentialsKey, 'password', {
    'username': email,
    'password': password
  });

  // Public

  return {
    call: callFunc,
    authenticatedCall: authenticatedCallFunc,
    authenticate: authenticateFunc
  };
};

export default client;
