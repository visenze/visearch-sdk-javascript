const URI = require('jsuri');
const FormData = require('form-data');
const fetch = typeof window === 'undefined' ? require('node-fetch') : window.fetch;
const { Base64 } = require('js-base64');
const isFunction = require('lodash.isfunction');
const { resizeImage } = require('./resizer');

const VERSION = '@@version'; // Gulp will replace this with actual version number
const USER_AGENT = `visearch-js-sdk/${VERSION}`;

/**
 * Adds a list of query parameters
 * @param  {params}  params object
 * @return {URI}     returns self for fluent chaining
 */
URI.prototype.addQueryParams = function addQueryParams(params) {
  Object.entries(params).forEach(([property, param]) => {
    // do stuff
    if (Array.isArray(param)) {
      for (let i = 0; i < param.length; i += 1) {
        this.addQueryParam(property, param[i]);
      }
    } else {
      this.addQueryParam(property, param);
    }
  }, this);
  return this;
};

// *********************************************
// Helper methods
// *********************************************

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(`Timed out in ${ms} ms.`);
    }, ms);
    return promise.then(resolve, reject);
  });
}

// *********************************************
// HTTP request methods
// *********************************************

/**
 * Generates basic auth string.
 */
function getBasicAuth(settings) {
  try {
    const user = settings.access_key;
    const password = settings.secret_key;
    const tok = `${user}:${password}`;
    const hash = Base64.encode(tok);
    return `Basic ${hash}`;
  } catch (err) {
    // Do nothing and return empty string
    return '';
  }
}

function hasBasicAuthorisation(settings) {
  return settings.access_key !== undefined && settings.secret_key !== undefined;
}

/**
 * Generates HTTP headers.
 */
function getHeaders(settings) {
  const output = {
    Accept: 'application/json',
    'X-Requested-With': settings.user_agent || USER_AGENT,
  };
  if (hasBasicAuthorisation(settings)) {
    output.Authorization = getBasicAuth(settings);
  }
  return output;
}

/**
 * Sends the request as configured in the fetch object.
 */
function sendRequest(t, fetchObj, path, optionsParam, callbackParam, failureParam) {
  let callback;
  let failure;
  if (isFunction(optionsParam)) {
    // Not options parameter
    callback = optionsParam;
    failure = callbackParam;
  } else {
    callback = callbackParam;
    failure = failureParam;
  }

  const start = new Date().getTime();
  let reqid = null;
  const timeoutInterval = t || 15000;
  return timeout(timeoutInterval, fetchObj)
    .then((response) => {
      const res = response.json();
      reqid = response.headers.get('X-Log-ID');
      return res;
    })
    .then((json) => {
      const stop = new Date().getTime();
      console.log(`ViSearch ${path} finished in ${stop - start}ms`);
      if (reqid && !json.reqid) {
        json.reqid = reqid;
      }
      if (isFunction(callback)) {
        callback(json);
      }
    })
    .catch((ex) => {
      console.error(`Failed to process api: ${path}.`, ex);
      if (isFunction(failure)) {
        failure(ex);
      }
    });
}

/**
 * Append analytics data
 * @param {*} params
 * @param {*} vaParams
 */
function appendAnalyticsData(params, vaParams) {
  if (vaParams) {
    params.va_uid = vaParams.uid;
    params.va_sdk = vaParams.sdk;
    params.va_sdk_version = vaParams.v;
    // search sid will take prority over analytics sid
    params.va_sid = params.va_sid || vaParams.sid;
    // search uid will take prority over analytics uid
    params.va_uid = params.va_uid || vaParams.uid;
  }
  return params;
}

module.exports = {
  sendGetRequest: (settings, endpoint, path, vaParams, params, options, callback, failure) => {
    const queryParams = appendAnalyticsData(params, vaParams);

    const url = new URI(endpoint)
      .setPath(path)
      .addQueryParams(queryParams)
      .toString();
    const fetchObj = fetch(url, {
      method: 'GET',
      headers: getHeaders(settings),
    });
    return sendRequest(settings.timeout, fetchObj, path, options, callback, failure);
  },
  sendPostRequest: async (settings, endpoint, path, vaParams, params, options, callback, failure) => {
    const url = new URI(endpoint)
      .setPath(path)
      .toString();

    const postData = new FormData();
    const queryParams = appendAnalyticsData(params, vaParams);

    if (queryParams.image) {
      const img = queryParams.image;
      delete queryParams.image;
      let resizedImage;
      if (img instanceof Blob) {
        resizedImage = await resizeImage(img);
      } else {
        resizedImage = await resizeImage(img.files[0]);
      }
      postData.append('image', resizedImage);
    }
    Object.entries(queryParams).forEach(([param, values]) => {
      if (Array.isArray(values)) {
        values.forEach((i) => {
          if (i != null) {
            postData.append(param, i);
          }
        });
      } else if (values != null) {
        postData.append(param, values);
      }
    });

    const fetchObj = fetch(url, {
      method: 'POST',
      headers: getHeaders(settings),
      body: postData,
    });
    return sendRequest(settings.timeout, fetchObj, path, options, callback, failure);
  },
};
