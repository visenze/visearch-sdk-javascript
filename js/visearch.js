/* eslint-disable global-require */

/**
 * SDK for ViSearch of visenze.com
 * @author dejun@visenze.com
 */
(function (context) {
  const fetch = typeof window === 'undefined' ? require('node-fetch') : window.fetch;
  const { Base64 } = require('js-base64');
  const {
    isObject, isFunction, extend, find, isArray,
  } = require('lodash/core');
  const URI = require('jsuri');
  const FormData = require('form-data');
  const va = require('visenze-tracking-javascript');

  if (typeof module === 'undefined' || !module.exports) {
    // For non-Node environments
    require('es5-shim/es5-shim');
    require('es5-shim/es5-sham');
  }

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
  // Global constants
  // *********************************************

  const QUERY_REQID = 'reqid';
  const QUERY_IMNAME = 'im_name';
  const QUERY_ACTION = 'action';
  const VERSION = '@@version'; // Gulp will replace this with actual version number
  const USER_AGENT = `visearch-js-sdk/${VERSION}`;
  const END_POINT = 'https://visearch.visenze.com/';
  const CN_END_POINT = 'https://visearch.visenze.com.cn/';

  /**
   * Adds a list of query parameters
   * @param  {params}  params object
   * @return {URI}     returns self for fluent chaining
   */
  URI.prototype.addQueryParams = function (params) {
    for (const property in params) {
      if (params.hasOwnProperty(property)) {
        const param = params[property];
        // do stuff
        if (isArray(param)) {
          for (let i = 0; i < param.length; i += 1) {
            this.addQueryParam(property, param[i]);
          }
        } else {
          this.addQueryParam(property, param);
        }
      }
    }
    return this;
  };

  // Set up visearch_obj

  const visearchObjName = context.__visearch_obj || 'visearch';
  const $visearch = context[visearchObjName] = context[visearchObjName] || {};
  $visearch.q = $visearch.q || [];

  // Start some inner vars and methods
  const settings = {};

  // Export setting for internal extends
  context.visearch_settings = settings;

  // Use prototypes to define all internal methods
  const prototypes = {};

  // tracker to send event
  let tracker;

  // Config settings
  prototypes.set = function () {
    if (arguments.length === 2) {
      settings[arguments[0]] = arguments[1];
    } else if (arguments.length > 2) {
      settings[arguments[0]] = arguments.slice(1);
    }
  };

  /**
   * Apply calling on prototypes methods.
   */
  function applyPrototypesCall(command) {
    if (prototypes.hasOwnProperty(command[0])) {
      const args = command.slice(1);
      prototypes[command[0]](...args);
    }
  }

  // *********************************************
  // Event tracking methods
  // *********************************************

  function getTracker() {
    if (!tracker && settings.tracker_code) {
      tracker = va.init({ code: settings.tracker_code, uid: settings.uid, isCN: settings.is_cn });
    }

    return tracker;
  }

  function getDefaultTrackingParams() {
    tracker = getTracker();

    if (tracker) {
      return tracker.getDefaultParams();
    }

    return null;
  }

  /**
   * Sends event to tracking service.
   */
  const sendEvent = function (action, params, callback = () => { }, failure = () => { }) {
    tracker = getTracker();

    if (tracker) {
      tracker.sendEvent(action, params,
        success => {
          callback(`ViSenze Analytics ${action} event ${success}`);
        }, err => {
          failure(err);
        });
    }
  };

  /**
   * Sends tracking event to server.
   */
  prototypes.send = (action, params, callback, failure) => {
    sendEvent(action, params, callback, failure);
  };

  // *********************************************
  // HTTP request methods
  // *********************************************

  /**
   * Generates basic auth string.
   */
  function getBasicAuth() {
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

  function hasBasicAuthorisation() {
    return settings.access_key !== undefined && settings.secret_key !== undefined;
  }

  /**
   * Generates HTTP headers.
   */
  function getHeaders() {
    const output = {
      Accept: 'application/json',
      'X-Requested-With': settings.user_agent || USER_AGENT,
    };
    if (hasBasicAuthorisation()) {
      output.Authorization = getBasicAuth();
    }
    return output;
  }

  /**
   * Sends the request as configured in the fetch object.
   */
  const sendRequest = (fetchObj, path, optionsParam, callbackParam, failureParam) => {
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
    const timeoutInterval = settings.timeout || 15000;
    return timeout(timeoutInterval, fetchObj)
      .then((response) => {
        const res = response.json();
        reqid = response.headers.get('X-Log-ID');
        return res;
      })
      .then((json) => {
        const stop = new Date().getTime();
        console.log(`ViSearch ${path} finished in ${stop - start}ms`);

        json.reqid = reqid;
        callback(json);
      })
      .catch((ex) => {
        console.error(`Failed to process ${path}`, ex);
        if (failure) {
          failure(ex);
        }
      });
  };

  /**
   * Sends a GET request.
   */
  const sendGetRequest = (path, params, options, callback, failure) => {
    const endpoint = settings.endpoint || (settings.is_cn === true ? CN_END_POINT : END_POINT);
    params.access_key = settings.app_key;

    // append analytics data
    const vaParams = getDefaultTrackingParams();
    if (vaParams) {
      params.va_uid = vaParams.uid;
      params.va_sid = vaParams.sid;
    }

    const url = new URI(endpoint)
      .setPath(path)
      .addQueryParams(params)
      .toString();
    const fetchObj = fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return sendRequest(fetchObj, path, options, callback, failure);
  };

  /**
   * Sends a POST request.
   */
  const sendPostRequest = (path, params, options, callback, failure) => {
    const endpoint = settings.endpoint || (settings.is_cn === true ? CN_END_POINT : END_POINT);
    params.access_key = settings.app_key;
    const url = new URI(endpoint)
      .setPath(path)
      .toString();

    const postData = new FormData();
    if (params.hasOwnProperty('image')) {
      const img = params.image;
      delete params.image;
      // Main magic with files here
      if (img instanceof Blob) {
        postData.append('image', img);
      } else {
        postData.append('image', img.files[0]);
      }
    }
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        const values = params[param];
        if (Array.isArray(values)) {
          for (const i in values) {
            if (values.hasOwnProperty(i) && values[i] != null) {
              postData.append(param, values[i]);
            }
          }
        } else if (values != null) {
          postData.append(param, values);
        }
      }
    }

    // append analytics data
    const vaParams = getDefaultTrackingParams();
    if (vaParams) {
      postData.append('va_uid', vaParams.uid);
      postData.append('va_sid', vaParams.sid);
    }

    const fetchObj = fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: postData,
    });
    return sendRequest(fetchObj, path, options, callback, failure);
  };

  prototypes.search = function (params, options, callback, failure) {
    return sendGetRequest('search', params, options, callback, failure);
  };

  // Make idsearch an alias of search
  prototypes.idsearch = prototypes.search;

  prototypes.recommendation = function (params, options, callback, failure) {
    return sendGetRequest('recommendation', params, options, callback, failure);
  };

  prototypes.similarproducts = function (params, options, callback, failure) {
    return sendPostRequest('similarproducts', params, options, callback, failure);
  };

  prototypes.out_of_stock = function (params, options, callback, failure) {
    return sendGetRequest('out_of_stock', params, options, callback, failure);
  };

  prototypes.uploadsearch = function (params, options, callback, failure) {
    return sendPostRequest('uploadsearch', params, options, callback, failure);
  };

  prototypes.discoversearch = function (params, options, callback, failure) {
    return sendPostRequest('discoversearch', params, options, callback, failure);
  };

  prototypes.colorsearch = function (params, options, callback, failure) {
    return sendGetRequest('colorsearch', params, options, callback, failure);
  };

  // Monitor the push event from outside

  $visearch.q = $visearch.q || [];
  $visearch.q.push = function (command) {
    applyPrototypesCall(command);
  };

  // retrival previous method define.
  const methodExports = $visearch.methods || [];
  for (const i in methodExports) {
    const m = methodExports[i];
    if (prototypes.hasOwnProperty(m)) {
      // export methods
      $visearch[m] = prototypes[m];
    }
  }

  // Apply method call for previous function settings
  for (const i in $visearch.q) {
    applyPrototypesCall($visearch.q[i]);
  }

  /**
   * Get query parameters from url [URI] object
   */
  function getQueryParamValue(uri, name) {
    return find([`__vi_${name}`, name], () => uri.getQueryParamValue(name));
  }

  // Set the status to indicate loaded success
  $visearch.loaded = true;

  if (typeof window !== 'undefined') {
    // For browser env
    // Check the link of current page, to check if the page is come from a previous search click.
    let refReqId = null;
    if (document.referrer) {
      const refUri = new URI(document.referrer);
      refReqId = getQueryParamValue(refUri, QUERY_REQID);
    }
    // Get reqid from current url or from its referrer url
    const curUri = new URI(window.location.href);
    const reqid = getQueryParamValue(curUri, QUERY_REQID) || refReqId;
    const imName = getQueryParamValue(curUri, QUERY_IMNAME);
    // If reqid, action and imName are found in current page content, send event tracking.
    if (reqid && imName) {
      // Get event 'action' for current page, will set it as 'click' action by default if not specified.
      const action = getQueryParamValue(curUri, QUERY_ACTION) || 'click';
      sendEvent(action, {
        queryId: getQueryParamValue(curUri, QUERY_REQID),
        im_name: getQueryParamValue(curUri, QUERY_IMNAME),
      });
    }
  }

  // Export for Node module
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = $visearch;
  }

  // Fix Lodash object leaking to window due to Webpack issue
  // Reference: https://github.com/webpack/webpack/issues/4465
  if (typeof window !== 'undefined' && window._ && window._.noConflict) {
    window._.noConflict();
  }
}(typeof self !== 'undefined' ? self : this));
