'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {
    var apiURL = _ref2.apiURL,
        contentType = _ref2.contentType,
        contentTypesDefaultData = _ref2.contentTypesDefaultData,
        singleType = _ref2.singleType,
        singleTypesDefaultData = _ref2.singleTypesDefaultData,
        jwtToken = _ref2.jwtToken,
        queryLimit = _ref2.queryLimit,
        reporter = _ref2.reporter;

    var apiBase, apiEndpoint, _ref3, data, defaultData, isDefaultData;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Define API endpoint.
            apiBase = singleType ? apiURL + '/' + singleType : apiURL + '/' + (0, _pluralize2.default)(contentType);
            apiEndpoint = apiBase + '?_limit=' + queryLimit;


            reporter.info('Starting to fetch data from Strapi - ' + apiEndpoint);

            _context.prev = 3;
            _context.next = 6;
            return (0, _axios2.default)(apiEndpoint, addAuthorizationHeader({}, jwtToken));

          case 6:
            _ref3 = _context.sent;
            data = _ref3.data;
            return _context.abrupt('return', (0, _lodash.castArray)(data).map(clean));

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](3);
            defaultData = singleType ? singleTypesDefaultData[singleType] : contentTypesDefaultData[(0, _pluralize2.default)(contentType)];
            isDefaultData = (0, _keys2.default)(defaultData).length !== 0;

            if (!(_context.t0.response.status === 404 && isDefaultData)) {
              _context.next = 20;
              break;
            }

            reporter.info('Use Default Data for singleType - ' + singleType);
            return _context.abrupt('return', (0, _lodash.castArray)(defaultData).map(clean));

          case 20:
            reporter.panic('Failed to fetch data from Strapi', _context.t0);

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[3, 11]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Remove fields starting with `_` symbol.
 *
 * @param {object} item - Entry needing clean
 * @returns {object} output - Object cleaned
 */
var clean = function clean(item) {
  (0, _lodash.forEach)(item, function (value, key) {
    if ((0, _lodash.endsWith)(key, 'component')) {
      item.component = item[key];
      delete item[key];
    } else if ((0, _lodash.startsWith)(key, '__')) {
      delete item[key];
    } else if ((0, _lodash.startsWith)(key, '_')) {
      delete item[key];
      item[key.slice(1)] = value;
    } else if ((0, _lodash.isObject)(value)) {
      item[key] = clean(value);
    }
  });

  return item;
};

var addAuthorizationHeader = function addAuthorizationHeader(options, token) {
  if (token) {
    (0, _lodash.set)(options, 'headers.Authorization', 'Bearer ' + token);
  }

  return options;
};