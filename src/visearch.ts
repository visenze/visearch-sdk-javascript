/**
 * SDK for visearch of visenze.com
 * @author dejun@visenze.com, @author rachel.ngo@visenze.com
 */

import find from 'lodash.find';
import URI from 'jsuri';
import va from 'visenze-tracking-javascript';
import { version } from './version.js';

import { searchById, searchByImage, searchByIdByPost } from './productsearch.js';
import { resizeImageFromDataUrl } from './resizer.js';
import isFunction from 'lodash.isfunction';
import { ProductSearchResponse, ViSearchSettings, ViSearchClient } from '../types/shared';
import { VAClient } from 'visenze-tracking-javascript/types/shared';

const STAGING_ENDPOINT = 'https://search-dev.visenze.com';
const ANALYTICS_STAGING_ENDPOINT = 'https://staging-analytics.data.visenze.com/v3';
const SDK = 'visearch js sdk';
const SDK_VERSION = version;
const QUERY_REQID = 'reqid';
const QUERY_IMNAME = 'im_name';
const QUERY_ACTION = 'action';
const RESULT_LOAD = 'result_load';

function getSdkVersion(): Record<string, string> {
  return {
    v: SDK_VERSION,
    sdk: SDK,
  };
}

/**
 * Get query parameters from url [URI] object
 */
function getQueryParamValue(uri: URI, name: string): unknown {
  return find([`__vi_${name}`, name], () => uri.getQueryParamValue(name));
}

export function ViSearch(configs?: Record<string, unknown>): ViSearchClient {
  const q: unknown[] = [];
  const settings: ViSearchSettings = {
    app_key: '',
    placement_id: '',
  };
  let lastQueryId: string;
  let tracker: VAClient;

  Object.defineProperty(q, 'push', (args: [keyof ViSearchClient, unknown]) => prototypes.apply_prototypes_call(args));

  if (configs) {
    Object.entries(configs).forEach(([key, value]) => {
      settings[key] = value;
    });
  }

  function getTracker(): VAClient {
    if (!tracker) {
      const code = `${settings.app_key}:${settings.placement_id}`;
      const endpoint =
        settings.analytics_endpoint ||
        (settings.endpoint === STAGING_ENDPOINT ? ANALYTICS_STAGING_ENDPOINT : undefined);
      const isCN = !!settings.is_cn;
      tracker = va({
        code,
        uid: settings.uid,
        endpoint,
        isCN,
      });
    }
    return tracker;
  }

  /**
   * if event is not provided, we send the default tracking params;
   * which includes: sdk, sid, ts, uid and version
   * @returns tracking parameters
   */
  function getDefaultTrackingParams(): Record<string, unknown> {
    tracker = getTracker();
    const trackerParams = tracker.getDefaultParams();
    if (tracker) {
      return { ...trackerParams, ...getSdkVersion() };
    }
    return {};
  }

  function sendResultLoadEvent(productId: string | undefined, resp: ProductSearchResponse): void {
    if (resp.status !== 'OK') {
      return;
    } else if ('objects' in resp && resp.objects.length === 0) {
      return;
    } else if ('result' in resp && resp.result.length === 0) {
      return;
    }

    const metadata: Record<string, unknown> = { queryId: resp.reqid };
    if (productId) {
      metadata.pid = productId;
    }
    // send out event if the pixel is in place
    if (window && window.vsPlacementLoaded && window.vsPlacementLoaded[settings.placement_id]) {
      prototypes.send(RESULT_LOAD, metadata);
    }
    // push result_load event to GTM datalayer if user enable GTM tracking
    if (settings.gtm_tracking) {
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      const data: {
        [key: string]: { queryId: string; pid?: string } | string;
      } = { event: 'vs_result_load' };
      const params: { queryId: string; pid?: string } = { queryId: resp.reqid };
      if (productId) {
        params.pid = productId;
      }
      data[settings.placement_id] = params;
      window.dataLayer.push(data);
    }
  }

  /**
   * Save the query Id of the last request to local storage if the request is successfull
   * @param {*} resp response from ProductSearch API
   */
  function saveQueryId(resp: ProductSearchResponse): void {
    if (resp.status !== 'OK') {
      return;
    }
    lastQueryId = resp.reqid;
    localStorage.setItem(`visenze_query_id_${settings.placement_id}`, lastQueryId);
  }

  /**
   * Wrapping response with addition method for abtesting tracking
   */
  function wrapExperimentResponse(resp: ProductSearchResponse): void {
    if (resp.status !== 'OK') {
      return;
    }
    if (resp.experiment && resp.experiment.experiment_no_recommendation) {
      resp.experiment_no_recommendation = true;
    }
  }

  /**
   * Wrapper for callback with additional send result_load event and new method to track a/b test
   * @param {*} resp response from ProductSearch API
   */
  function wrapCallback(
    productId: string | undefined,
    callback: ((resp: ProductSearchResponse) => void) | undefined,
    resp: ProductSearchResponse
  ): void {
    wrapExperimentResponse(resp);
    callback?.(resp);
    saveQueryId(resp);
    sendResultLoadEvent(productId, resp);
  }

  function sendRefClickEvent(): void {
    // For browser env
    // Check the link of current page, to check if the page is come from a previous search click.
    let refReqId: unknown = null;
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
      const action = (getQueryParamValue(curUri, QUERY_ACTION) as string) || 'click';
      prototypes.send(action, {
        queryId: getQueryParamValue(curUri, QUERY_REQID),
        im_name: getQueryParamValue(curUri, QUERY_IMNAME),
      });
    }
  }

  if (typeof window !== 'undefined') {
    sendRefClickEvent();
  }

  const prototypes: ViSearchClient = {
    q,
    set: function (key, value) {
      settings[key] = value;
    },
    set_keys: function (configs) {
      Object.entries(configs).forEach(([key, value]) => {
        settings[key] = value;
      });
    },
    send: function (action, eventParams, callback, failure) {
      const tracker = getTracker();
      const params = { ...getSdkVersion(), ...eventParams };

      if (tracker) {
        tracker.sendEvent(
          action,
          params,
          () => {
            callback?.(action, params);
          },
          (err) => {
            failure?.(err, params);
          }
        );
      }
    },
    send_events: function (action, eventParamsList, callback, failure) {
      const tracker = getTracker();

      if (tracker && tracker.validateEvents(eventParamsList, failure)) {
        const batchId = tracker.generateUUID();

        eventParamsList.forEach((eventParams) => {
          const params = {
            ...eventParams,
            ...getSdkVersion(),
          };

          if (action.toLowerCase() === 'transaction' && !params.transId) {
            params.transId = batchId;
          }

          prototypes.send(action, params, callback, failure);
        });
      }
    },
    product_search_by_image: function (params, callback, failure) {
      const altCallback = wrapCallback.bind(undefined, undefined, callback);
      return searchByImage(settings, params, getDefaultTrackingParams(), altCallback, failure);
    },
    product_search_by_id: function (productId, params, callback, failure) {
      const altCallback = wrapCallback.bind(undefined, undefined, callback);
      return searchById(settings, productId, params, getDefaultTrackingParams(), altCallback, failure);
    },
    product_recommendations: function (productId, params, callback, failure) {
      return this.product_search_by_id(productId, params, callback, failure);
    },
    product_recommendations_by_post: function (productId, params, callback, failure) {
      const altCallback = wrapCallback.bind(undefined, undefined, callback);
      return searchByIdByPost(settings, productId, params, getDefaultTrackingParams(), altCallback, failure);
    },
    product_search_by_id_by_post: function (productId, params, callback, failure) {
      return this.product_recommendations_by_post(productId, params, callback, failure);
    },
    set_uid: function (uid, callback, failure) {
      tracker = getTracker();
      if (tracker) {
        tracker.setUID(uid);
        callback?.(uid);
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
    get_uid: function (callback, failure) {
      const tracker = getTracker();
      if (tracker) {
        callback(tracker.getUID());
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
    get_sid: function (callback, failure) {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.getSID());
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
    get_last_query_id: function (callback, failure) {
      try {
        if (lastQueryId) {
          callback(lastQueryId);
        } else {
          callback(localStorage.getItem(`visenze_query_id_${settings.placement_id}`));
        }
      } catch (err) {
        failure?.(err);
      }
    },
    get_session_time_remaining: function (callback, failure) {
      tracker = getTracker();
      if (tracker) {
        callback(tracker.getSessionTimeRemaining());
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
    reset_session: function (callback, failure) {
      tracker = getTracker();
      if (tracker) {
        callback?.(tracker.resetSession());
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
    get_default_tracking_params: function (callback, failure) {
      tracker = getTracker();
      if (tracker) {
        callback(getDefaultTrackingParams());
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
    apply_prototypes_call: function (command) {
      const fnName = command[0];
      const args = command.slice(1);
      if (isFunction(prototypes[fnName])) {
        prototypes[fnName](...args);
      }
    },
    resize_image: async function (imageAsDataUrl, resizeSettings, onSuccess, onFailure) {
      try {
        const img = await resizeImageFromDataUrl(imageAsDataUrl, resizeSettings || settings.resize_settings);
        onSuccess(img);
      } catch (err) {
        onFailure?.(err);
      }
    },
    generate_uuid: function (callback, failure) {
      const tracker = getTracker();
      if (tracker) {
        callback(tracker.generateUUID());
      } else {
        failure?.(Error('Tracker is not found'));
      }
    },
  };

  return prototypes;
}
