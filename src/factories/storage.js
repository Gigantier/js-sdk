const storage = () => {
  const getLocalStorage = () => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    } else {
      let LocalStorage = require('node-localstorage').LocalStorage;
      return new LocalStorage('./localStorage');
    }
  };

  return {
    set: (key, value) => getLocalStorage().setItem(key, value),
    get: (key) => getLocalStorage().getItem(key),
    delete: (key) => getLocalStorage().removeItem(key)
  };
};

export default storage;
