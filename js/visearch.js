/**
 * SDK for visearch of visenze.com
 * @author dejun@visenze.com, rachel.ngo@visenze.com
 */

const find = require('lodash.find');
const isFunction = require('lodash.isfunction');
const va = require('visenze-tracking-javascript');
const URI = require('jsuri');
const pjson = require('../package.json');
const { searchbyid, searchbyimage, searchbyidbypost } = require('./productsearch');
const { resizeImageFromDataUrl } = require('./resizer');

const STAGING_ENDPOINT = 'https://search-dev.visenze.com';
const ANALYTICS_STAGING_ENDPOINT = 'https://staging-analytics.data.visenze.com/v3';
const SDK = 'visearch js sdk';
const SDK_VERSION = pjson.version;
const QUERY_REQID = 'reqid';
const QUERY_IMNAME = 'im_name';
const QUERY_ACTION = 'action';
const RESULT_LOAD = 'result_load';

// Wrapper for non node environment
(function init(context) {
  function ViSearch() {
    const settings = {};
    const prototypes = {};
    this.prototypes = prototypes;
    this.q = this.q || [];
    // tracker to send event
    let tracker;
    let queryId;

    /**
     * Apply calling on prototypes methods.
     */
    function applyPrototypesCall(command) {
      if (prototypes[command[0]]) {
        const args = command.slice(1);
        prototypes[command[0]](...args);
      }
    }

    function getTracker() {
      if (!tracker) {
        const code = `${settings.app_key}:${settings.placement_id}`;
        const endpoint = settings.analytics_endpoint
          || (settings.endpoint === STAGING_ENDPOINT ? ANALYTICS_STAGING_ENDPOINT : null);
        tracker = va.init({
          code, uid: settings.uid, isCN: settings.is_cn, endpoint,
        });
      }
      return tracker;
    }

    function setSdkVersion(params = {}) {
      params.v = SDK_VERSION;
      params.sdk = SDK;

      return params;
    }

    /**
     * if event is not provided, we send the default tracking params;
     * which includes: sdk, sid, ts, uid and version
     * @returns tracking parameters
     */
    function getDefaultTrackingParams() {
      tracker = getTracker();
      if (tracker) {
        let params = tracker.getDefaultParams();
        params = setSdkVersion(params);
        return params;
      }
      return null;
    }


    function sendEvent(action, event, callback = () => { }, failure = () => { }) {
      tracker = getTracker();
      const trackingParams = setSdkVersion(event);

      if (tracker) {
        tracker.sendEvent(action, trackingParams,
          () => {
            callback(action, trackingParams);
          }, (err) => {
            failure(err, trackingParams);
          });
      }
    }

    function sendEvents(action, events, callback = () => { }, failure = () => { }) {
      tracker = getTracker();

      if (tracker && tracker.validateEvents(events, failure)) {
        const batchId = tracker.generateUUID();

        events.forEach((event) => {
          event.v = SDK_VERSION;
          event.sdk = SDK;

          if (action.toLowerCase() === 'transaction' && !event.transId) {
            event.transId = batchId;
          }

          sendEvent(action, event, callback, failure);
        });
      }
    }

    /**
     * Get query parameters from url [URI] object
     */
    function getQueryParamValue(uri, name) {
      return find([`__vi_${name}`, name], () => uri.getQueryParamValue(name));
    }

    /**
     * Wrapping response with addition method for abtesting tracking
     */
    function wrapExperimentResponse(args) {
      function experimentNoRecommendation() {
        if (this.experiment && this.experiment.experiment_no_recommendation) {
          return true;
        }
        return false;
      }
      if (args.status === 'OK') {
        args.experimentNoRecommendation = experimentNoRecommendation;
      }
    }

    function sendResultLoadEvent(productId, args) {
      if (args.status !== 'OK' || args.result.length === 0) {
        return;
      }
      const metadata = { queryId: args.reqid };
      if (productId) {
        metadata.pid = productId;
      }
      // send out event if the pixel is in place
      if (context && context.vsPlacementLoaded && context.vsPlacementLoaded[settings.placement_id]) {
        sendEvent(RESULT_LOAD, metadata);
      }
      // push result_load event to GTM datalayer if user enable GTM tracking
      if (settings.gtm_tracking) {
        if (!window.dataLayer) {
          window.dataLayer = [];
        }
        const data = { event: 'vs_result_load' };
        data[settings.placement_id] = { queryId: args.reqid };
        if (productId) {
          data[settings.placement_id].pid = productId;
        }
        window.dataLayer.push(data);
      }
    }

    /**
     * Save the query Id of the last request to local storage if the request is successfull
     * @param {*} resp response from ProductSearch API
     */
    function saveQueryId(resp) {
      if (resp.status !== 'OK' || resp.result.length === 0) {
        return;
      }
      queryId = resp.reqid;
      localStorage.setItem(`visenze_query_id_${settings.placement_id}`, queryId);
    }

    /**
     * Wrapper for callback with additional send result_load event and new method to track a/b test
     * @param {*} resp response from ProductSearch API
     */
    function wrapCallback(productId, callback, resp) {
      wrapExperimentResponse(resp);
      callback(resp);
      saveQueryId(resp);
      sendResultLoadEvent(productId, resp);
    }

    prototypes.set = (key, value) => {
      settings[key] = value;
    };

    prototypes.setKeys = (configs) => {
      Object.entries(configs).forEach(([key, value]) => {
        settings[key] = value;
      });
    };

    prototypes.send = (action, event, callback, failure) => {
      sendEvent(action, event, callback, failure);
    };

    prototypes.send_events = (action, events, callback, failure) => {
      sendEvents(action, events, callback, failure);
    };

    prototypes.product_search_by_image = (params, options, callback, failure) => {
      let altOptions;
      let altCallback;
      if (isFunction(options)) {
        altOptions = wrapCallback.bind(this, null, options);
        altCallback = callback;
      } else {
        altOptions = options;
        altCallback = wrapCallback.bind(this, null, callback);
      }

      return searchbyimage(settings, params, getDefaultTrackingParams(),
        altOptions, altCallback, failure);
    };

    prototypes.product_search_by_id = (productId, params, options, callback, failure) => {
      let altOptions;
      let altCallback;
      if (isFunction(options)) {
        altOptions = wrapCallback.bind(this, productId, options);
        altCallback = callback;
      } else {
        altOptions = options;
        altCallback = wrapCallback.bind(this, productId, callback);
      }

      return searchbyid(settings, productId, params, getDefaultTrackingParams(),
        altOptions, altCallback, failure);
    };

    prototypes.product_recommendations = prototypes.product_search_by_id;

    // temp work around, should be removed later
    prototypes.product_search_by_id_by_post = (productId, params, options, callback, failure) => {
      let altOptions;
      let altCallback;
      if (isFunction(options)) {
        altOptions = wrapCallback.bind(this, productId, options);
        altCallback = callback;
      } else {
        altOptions = options;
        altCallback = wrapCallback.bind(this, productId, callback);
      }

      return searchbyidbypost(settings, productId, params, getDefaultTrackingParams(),
        altOptions, altCallback, failure);
    };

    prototypes.product_recommendations_by_post = prototypes.product_search_by_id_by_post;

    /**
     * Manage tracker UID & SID
     */
    prototypes.set_uid = (uid, callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        tracker.setUID(uid);
        callback('success');
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    prototypes.get_uid = (callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.getUID());
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    prototypes.get_sid = (callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.getSID());
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    prototypes.get_last_query_id = (callback = () => { }, failure = () => { }) => {
      try {
        if (queryId) {
          callback(queryId);
        } else {
          callback(localStorage.getItem(`visenze_query_id_${settings.placement_id}`));
        }
      } catch (err) {
        failure(err);
      }
    };

    prototypes.get_session_time_remaining = (callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.getSessionTimeRemaining());
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    prototypes.reset_session = (callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.resetSession());
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    prototypes.get_default_tracking_params = (callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        callback(getDefaultTrackingParams());
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    prototypes.apply_prototypes_call = (command) => {
      applyPrototypesCall(command);
    };

    prototypes.export_methods = (factory, methods) => {
      methods.forEach((m) => {
        if (prototypes[m]) {
          // export methods
          factory[m] = prototypes[m];
        }
      });
    };

    prototypes.resize_image = (imageAsDataUrl, resizeSettings, onSuccess, onFailure) => {
      try {
        const img = resizeImageFromDataUrl(imageAsDataUrl, resizeSettings || settings.resizeSettings);
        onSuccess(img);
      } catch (err) {
        onFailure(err);
      }
    };

    prototypes.generate_uuid = (callback = () => { }, failure = () => { }) => {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.generateUUID());
      } else {
        failure(Error('Tracker is not found'));
      }
    };

    this.q.push = function push(command) {
      applyPrototypesCall(command);
    };

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
  }

  const initVisearchFactory = (factory) => {
    const $visearch = new ViSearch();
    $visearch.q = factory.q || [];
    $visearch.q.push = function push(command) {
      $visearch.prototypes.apply_prototypes_call(command);
    };
    // retrival previous method define.
    $visearch.prototypes.export_methods(factory, factory.methods || []);

    // Apply method call for previous function settings
    $visearch.q.forEach((item) => {
      $visearch.prototypes.apply_prototypes_call(item);
    });
  };

  if (!context.initVisearchFactory) {
    context.initVisearchFactory = initVisearchFactory;
  }

  // Export for Node module
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ViSearch;
  }

  // eslint-disable-next-line no-restricted-globals
}(typeof self !== 'undefined' ? self : this));
