/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
/* eslint-disable global-require */

/**
 * SDK for ViSearch of visenze.com
 * @author dejun@visenze.com
 */
// eslint-disable-next-line no-unused-vars
(function (context) {
  const find = require('lodash.find');
  const va = require('visenze-tracking-javascript');
  const ProductSearch = require('./productsearch');
  const ImageSearch = require('./imagesearch');
  const URI = require('jsuri');
  const STAGING_ENDPOINT = 'https://search-dev.visenze.com';
  const ANALYTICS_STAGING_ENDPOINT = 'https://staging-analytics.data.visenze.com/v3';
  const isFunction = require('lodash.isfunction');

  if (typeof module === 'undefined' || !module.exports) {
    // For non-Node environments
    require('es5-shim/es5-shim');
    require('es5-shim/es5-sham');
  }

  // *********************************************
  // Global constants
  // *********************************************

  const QUERY_REQID = 'reqid';
  const QUERY_IMNAME = 'im_name';
  const QUERY_ACTION = 'action';
  const RESULT_LOAD = 'result_load';

  // Set up visearch_obj
  let $visearch = {};
  $visearch.q = $visearch.q || [];
  if ($visearch.loaded) {
    return;
  }

  // Start some inner vars and methods
  const settings = {};

  // Export setting for internal extends
  // context.visearch_settings = settings;

  // Use prototypes to define all internal methods
  const prototypes = {};

  // tracker to send event
  let tracker;

  // wrapper for visearch api
  const imagesearch = new ImageSearch();

  // wrapper for product based api
  const productsearch = new ProductSearch();

  // Config settings
  prototypes.set = function (key, value) {
    settings[key] = value;
    imagesearch.set(key, value);
    productsearch.set(key, value);
  };

  /**
   * Apply calling on prototypes methods.
   */
  function applyPrototypesCall(command) {
    if (prototypes[command[0]]) {
      const args = command.slice(1);
      prototypes[command[0]](...args);
    }
  }

  // *********************************************
  // Event tracking methods
  // *********************************************

  function getTracker() {
    if (!tracker) {
      const code = settings.tracker_code ? settings.tracker_code : `${settings.app_key}:${settings.placement_id}`;
      const endpoint = settings.analytics_endpoint || (settings.endpoint === STAGING_ENDPOINT ? ANALYTICS_STAGING_ENDPOINT : null);
      tracker = va.init({
        code, uid: settings.uid, isCN: settings.is_cn, endpoint,
      });
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
        () => {
          callback(action, params);
        }, (err) => {
          failure(err);
        });
    }
  };

  /**
   * Get query parameters from url [URI] object
   */
  function getQueryParamValue(uri, name) {
    return find([`__vi_${name}`, name], () => uri.getQueryParamValue(name));
  }

  /**
   * Wrapper for callback function with additional send result_load event
   */
  function callbackWrap(productId, callback, args) {
    callback(args);

    if (args.status === 'OK' && args.result.length > 0) {
      // send out event if the pixel is in place
      const metadata = { queryId: args.reqid };
      if (productId) {
        metadata.pid = productId;
      }
      if (args.reqid && context.vsPlacementLoaded && context.vsPlacementLoaded[settings.placement_id]) {
        sendEvent(RESULT_LOAD, metadata);
      }

      // send out event if enable GTM data
      if (settings.gtm_tracking) {
        if (!window.dataLayer) {
          window.dataLayer = [];
        }
        const data = {'event': 'vs_result_load'};
        data[settings.placement_id] = {'queryId': args.reqid};
        if (productId) {
          data[settings.placement_id].pid = productId;
        }
        window.dataLayer.push(data);
      }
    }
  }


  /**
   * Sends tracking event to server.
   */
  prototypes.send = (action, params, callback, failure) => {
    sendEvent(action, params, callback, failure);
  };

  prototypes.search = function (params, options, callback, failure) {
    return imagesearch.search(params, getDefaultTrackingParams(), options, callback, failure);
  };

  // Make idsearch an alias of search
  prototypes.idsearch = prototypes.search;

  prototypes.recommendation = function (params, options, callback, failure) {
    return imagesearch.recommendation(params, getDefaultTrackingParams(),
      options, callback, failure);
  };

  prototypes.similarproducts = function (params, options, callback, failure) {
    return imagesearch.similarproducts(params, getDefaultTrackingParams(),
      options, callback, failure);
  };

  prototypes.out_of_stock = function (params, options, callback, failure) {
    return imagesearch.out_of_stock(params, getDefaultTrackingParams(), options, callback, failure);
  };

  prototypes.uploadsearch = function (params, options, callback, failure) {
    return imagesearch.uploadsearch(params, getDefaultTrackingParams(), options, callback, failure);
  };

  prototypes.discoversearch = function (params, options, callback, failure) {
    return imagesearch.discoversearch(params, getDefaultTrackingParams(),
      options, callback, failure);
  };

  prototypes.colorsearch = function (params, options, callback, failure) {
    return imagesearch.colorsearch(params, getDefaultTrackingParams(), options, callback, failure);
  };

  prototypes.product_search_by_image = function (params, options, callback, failure) {
    let altOptions;
    let altCallback;
    if (isFunction(options)) {
      altOptions = callbackWrap.bind(this, null, options);
      altCallback = callback;
    } else {
      altOptions = options;
      altCallback = callbackWrap.bind(this, null, callback);
    }

    return productsearch.searchbyimage(params, getDefaultTrackingParams(),
      altOptions, altCallback, failure);
  };

  prototypes.product_search_by_id = function (productId, params, options, callback, failure) {
    let altOptions;
    let altCallback;
    if (isFunction(options)) {
      altOptions = callbackWrap.bind(this, productId, options);
      altCallback = callback;
    } else {
      altOptions = options;
      altCallback = callbackWrap.bind(this, productId, callback);
    }

    return productsearch.searchbyid(productId, params, getDefaultTrackingParams(),
      altOptions, altCallback, failure);
  };

  prototypes.product_recommendations = function (productId, params, options, callback, failure) {
    return this.product_search_by_id(productId, params, options, callback, failure);
  };

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
      // Get event 'action' for page will set it as 'click' action by default if not specified.
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

  $visearch.q = $visearch.q || [];

  // eslint-disable-next-line func-names
  $visearch.q.push = function (command) {
    applyPrototypesCall(command);
  };

  const initVisearchFactory = function (factory) {
    $visearch = factory;
    $visearch.q = $visearch.q || [];

    // eslint-disable-next-line func-names
    $visearch.q.push = function (command) {
      applyPrototypesCall(command);
    };

    // retrival previous method define.
    const methodExports = $visearch.methods || [];
    for (const i in methodExports) {
      const m = methodExports[i];
      if (prototypes[m]) {
        // export methods
        $visearch[m] = prototypes[m];
      }
    }

    // Apply method call for previous function settings
    for (const i in $visearch.q) {
      applyPrototypesCall($visearch.q[i]);
    }

    // Set the status to indicate loaded success
    $visearch.loaded = true;
  };

  context.initVisearchFactory = initVisearchFactory;
  if (context.initFactoryArray) {
    context.initFactoryArray.push({ init: initVisearchFactory });
  } else {
    context.initFactoryArray = [{ init: initVisearchFactory }];
  }

// eslint-disable-next-line no-restricted-globals
}(typeof self !== 'undefined' ? self : this));
