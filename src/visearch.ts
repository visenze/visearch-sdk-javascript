/**
 * SDK for visearch of visenze.com
 * @author dejun@visenze.com, @author rachel.ngo@visenze.com
 */

import find from 'lodash.find';
import URI from 'jsuri';
import va from 'visenze-tracking-javascript';
import { version } from './version';

import {
  searchById,
  searchByImage,
  searchByIdByPost,
} from './productsearch';
import { resizeImageFromDataUrl } from './resizer';
import isFunction from 'lodash.isfunction';
import { PSResponse, ViSearchSettings, GenericCallback, PSResizeSettings, ViSearchClient } from '../types/shared';
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
  const q: any = [];
  const settings: ViSearchSettings = {
    app_key: '',
    placement_id: ''
  };
  const prototypes: ViSearchClient = {
    q,
    set,
    set_keys: setKeys,
    send: sendEvent,
    send_events: sendEvents,
    product_search_by_image: productSearchByImage,
    product_search_by_id: productSearchById,
    product_recommendations: productSearchById,
    product_recommendations_by_post: productSearchByIdByPost,
    product_search_by_id_by_post: productSearchByIdByPost,
    set_uid: setUid,
    get_uid: getUid,
    get_sid: getSid,
    get_last_query_id: getLastQueryId,
    get_session_time_remaining: getSessionTimeRemaining,
    reset_session: resetSession,
    get_default_tracking_params: getTrackingParams,
    apply_prototypes_call: applyPrototypesCall,
    resize_image: resizeImage,
    generate_uuid: generateUuid
  };
  let lastQueryId: string;
  let tracker: VAClient;

  Object.defineProperty(q, 'push', (args: [string, unknown]) => applyPrototypesCall(args));

  if (configs) {
    Object.entries(configs).forEach(([key, value]) => {
      settings[key] = value;
    })
  }

  /**
   * Apply calling on prototypes methods.
   */
  function applyPrototypesCall(command: [string, unknown]): void {
    const fnName = command[0];
    const args = command.slice(1);
    if (isFunction(prototypes[fnName])) {
      prototypes[fnName](...args);
    }
  }

  function getTracker(): VAClient {
    if (!tracker) {
      const code = `${settings.app_key}:${settings.placement_id}`;
      const endpoint = settings.analytics_endpoint || (settings.endpoint === STAGING_ENDPOINT
        ? ANALYTICS_STAGING_ENDPOINT
        : undefined);
      tracker = va({
        code,
        uid: settings.uid,
        endpoint,
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

  function sendEvent(action: string, eventParams: Record<string, unknown>, callback?: (action: string, eventParams: Record<string, unknown>) => void, failure?: GenericCallback): void {
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
        },
      );
    }
  }

  function sendEvents(
    action: string,
    eventParamsList: Record<string, unknown>[],
    callback?: (action: string, eventParams: Record<string, unknown>) => void,
    failure?: GenericCallback,
  ): void {
    const tracker = getTracker();

    if (tracker && tracker.validateEvents(eventParamsList, failure)) {
      const batchId = tracker.generateUUID();

      eventParamsList.forEach((eventParams) => {
        const params = {
          ...eventParams, ...getSdkVersion(),
        };

        if (action.toLowerCase() === 'transaction' && !params.transId) {
          params.transId = batchId;
        }

        sendEvent(action, params, callback, failure);
      });
    }
  }

  function sendResultLoadEvent(productId: string | undefined, resp: PSResponse): void {
    if (resp.status !== 'OK') {
      return;
    } else if ('objects' in resp && resp.objects.length === 0) {
      return;
    } else if (resp.result.length === 0) {
      return;
    }

    const metadata: Record<string, unknown> = { queryId: resp.reqid };
    if (productId) {
      metadata.pid = productId;
    }
    // send out event if the pixel is in place
    if (window && window.vsPlacementLoaded
      && window.vsPlacementLoaded[settings.placement_id]
    ) {
      sendEvent(RESULT_LOAD, metadata);
    }
    // push result_load event to GTM datalayer if user enable GTM tracking
    if (settings.gtm_tracking) {
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      const data = { event: 'vs_result_load' };
      data[settings.placement_id] = { queryId: resp.reqid };
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
  function saveQueryId(resp: PSResponse): void {
    if (resp.status !== 'OK' || resp.result.length === 0) {
      return;
    }
    lastQueryId = resp.reqid;
    localStorage.setItem(
      `visenze_query_id_${settings.placement_id}`,
      lastQueryId,
    );
  }

  /**
   * Wrapping response with addition method for abtesting tracking
   */
  function wrapExperimentResponse(resp: PSResponse): void {
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
  function wrapCallback(productId: string | undefined, callback: ((resp: PSResponse) => void) | undefined, resp: PSResponse): void {
    wrapExperimentResponse(resp);
    callback?.(resp);
    saveQueryId(resp);
    sendResultLoadEvent(productId, resp);
  }

  function set(key, value): void {
    settings[key] = value;
  }

  function setKeys(configs): void {
    Object.entries(configs).forEach(([key, value]) => {
      settings[key] = value;
    });
  }

  function productSearchByImage(
    params: Record<string, unknown>,
    callback?: (resp: PSResponse) => void,
    failure?: GenericCallback,
  ): Promise<void> {
    const altCallback = wrapCallback.bind(undefined, undefined, callback);

    return searchByImage(
      settings,
      params,
      getDefaultTrackingParams(),
      altCallback,
      failure,
    );
  }

  function productSearchById(
    productId: string,
    params: Record<string, unknown> | undefined,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback,
  ): Promise<void> {
    const altCallback = wrapCallback.bind(undefined, undefined, callback);

    return searchById(
      settings,
      productId,
      params,
      getDefaultTrackingParams(),
      altCallback,
      failure,
    );
  }

  function productSearchByIdByPost(
    productId: string,
    params: Record<string, unknown> | undefined,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback,
  ): Promise<void> {
    const altCallback = wrapCallback.bind(undefined, undefined, callback);

    return searchByIdByPost(
      settings,
      productId,
      params,
      getDefaultTrackingParams(),
      altCallback,
      failure,
    );
  }

  function setUid(uid: string, callback: (uid: string) => void, failure?: GenericCallback): void {
    tracker = getTracker();
    if (tracker) {
      tracker.setUID(uid);
      callback(uid);
    } else {
      failure?.(Error('Tracker is not found'));
    }
  }

  function getUid(callback: (uid: string) => void, failure?: GenericCallback): void {
    const tracker = getTracker();
    if (tracker) {
      callback(tracker.getUID());
    } else {
      failure?.(Error('Tracker is not found'));
    }
  }

  function getSid(callback: (sid: string) => void, failure?: GenericCallback): void {
    tracker = getTracker();
    if (tracker) {
      callback(tracker.getSID());
    } else {
      failure?.(Error('Tracker is not found'));
    }
  }

  function getLastQueryId(
    callback: (lastQueryId: string | null) => void,
    failure?: GenericCallback,
  ): void {
    try {
      if (lastQueryId) {
        callback(lastQueryId);
      } else {
        callback(
          localStorage.getItem(`visenze_query_id_${settings.placement_id}`),
        );
      }
    } catch (err) {
      failure?.(err);
    }
  }

  function getSessionTimeRemaining(
    callback: GenericCallback,
    failure?: GenericCallback,
  ): void {
    tracker = getTracker();
    if (tracker) {
      callback(tracker.getSessionTimeRemaining());
    } else {
      failure?.(Error('Tracker is not found'));
    }
  }

  function resetSession(callback: GenericCallback, failure?: GenericCallback): void {
    tracker = getTracker();
    if (tracker) {
      callback(tracker.resetSession());
    } else {
      failure?.(Error('Tracker is not found'));
    }
  }

  function getTrackingParams(
    callback: (params: Record<string, unknown>) => void,
    failure?: GenericCallback,
  ): void {
    tracker = getTracker();
    if (tracker) {
      callback(getDefaultTrackingParams());
    } else {
      failure?.(Error('Tracker is not found'));
    }
  }

  async function resizeImage(
    imageAsDataUrl: string,
    resizeSettings: PSResizeSettings | undefined,
    onSuccess: GenericCallback,
    onFailure?: GenericCallback,
  ): Promise<void> {
    try {
      const img = await resizeImageFromDataUrl(
        imageAsDataUrl,
        resizeSettings || settings.resize_settings,
      );
      onSuccess(img);
    } catch (err) {
      onFailure?.(err);
    }
  }

  function generateUuid(callback: (uuid: string) => void, failure?: GenericCallback): void {
    const tracker = getTracker();
    if (tracker) {
      callback(tracker.generateUUID());
    } else {
      failure?.(Error('Tracker is not found'));
    }
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
      const action = getQueryParamValue(curUri, QUERY_ACTION) as string || 'click';
      sendEvent(action, {
        queryId: getQueryParamValue(curUri, QUERY_REQID),
        im_name: getQueryParamValue(curUri, QUERY_IMNAME),
      });
    }
  }

  if (typeof window !== 'undefined') {
    sendRefClickEvent();
  }

  return prototypes;
}
