"use strict";

exports.__esModule = true;
exports.createWebStoragePersistor = createWebStoragePersistor;

var _utils = require("../core/utils");

function createWebStoragePersistor(_ref) {
  var storage = _ref.storage,
      _ref$key = _ref.key,
      key = _ref$key === void 0 ? "REACT_QUERY_OFFLINE_CACHE" : _ref$key,
      _ref$throttleTime = _ref.throttleTime,
      throttleTime = _ref$throttleTime === void 0 ? 1000 : _ref$throttleTime;

  if (typeof storage !== 'undefined') {
    return {
      persistClient: throttle(function (persistedClient) {
        storage.setItem(key, JSON.stringify(persistedClient));
      }, throttleTime),
      restoreClient: function restoreClient() {
        var cacheString = storage.getItem(key);

        if (!cacheString) {
          return;
        }

        return JSON.parse(cacheString);
      },
      removeClient: function removeClient() {
        storage.removeItem(key);
      }
    };
  }

  return {
    persistClient: _utils.noop,
    restoreClient: _utils.noop,
    removeClient: _utils.noop
  };
}

function throttle(func, wait) {
  if (wait === void 0) {
    wait = 100;
  }

  var timer = null;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (timer === null) {
      timer = setTimeout(function () {
        func.apply(void 0, args);
        timer = null;
      }, wait);
    }
  };
}