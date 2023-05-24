import URI from 'jsuri';
import FormData from 'form-data';
import isFunction from 'lodash.isfunction';
import { version } from './version';
import { resizeImage } from './resizer';
import { ViSearchSettings, GenericCallback, PSResponse } from '../types/shared';
import fetch, { Response } from 'node-fetch';
const DEFAULT_TIMEOUT = 15000;
const USER_AGENT = `visearch-js-sdk/${version}`;

// *********************************************
// Helper methods
// *********************************************

function timeout(ms: number, promise: Promise<unknown>): Promise<unknown> {
  const to = new Promise((_, reject) => setTimeout(() => reject(Error(`Timed out in ${ms} ms`)), ms));
  return Promise.race([to, promise]);
}

// *********************************************
// HTTP request methods
// *********************************************

/**
 * Generates HTTP headers.
 */
function getHeaders(settings: ViSearchSettings): Record<string, any> {
  const output: Record<string, any> = {
    Accept: 'application/json',
    'X-Requested-With': settings.user_agent || USER_AGENT,
  };
  return output;
}

/**
 * Sends the request as configured in the fetch object.
 */
function sendRequest(timeoutInMS: number | undefined, fetchObj: Promise<Response>, path: string, callback?: GenericCallback, failure?: GenericCallback): Promise<void> {
  const start = new Date().getTime();
  let reqid: string | null;
  return timeout(timeoutInMS || DEFAULT_TIMEOUT, fetchObj)
    .then((response) => {
      const res: unknown = (response as Response).json();
      reqid = (response as Response).headers.get('X-Log-ID');
      return res;
    })
    .then((json) => {
      const stop = new Date().getTime();
      console.log(`ViSearch ${path} finished in ${stop - start}ms`);
      if (reqid && !(json as PSResponse).reqid) {
        (json as PSResponse).reqid = reqid;
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

export const sendGetRequest = (settings: ViSearchSettings, endpoint: string, path: string, queryParams: Record<string, unknown>, callback?: GenericCallback, failure?: GenericCallback): Promise<void> => {
  const url = new URI(endpoint).setPath(path);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.addQueryParam(key, value as string);
  });

  const fetchObj = fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(settings),
  });
  return sendRequest(settings.timeout, fetchObj, path, callback, failure);
};

export const sendPostRequest = async (settings: ViSearchSettings, endpoint: string, path: string, queryParams: Record<string, unknown>, callback?: GenericCallback, failure?: GenericCallback): Promise<void> => {
  const url = new URI(endpoint)
    .setPath(path)
    .toString();

  const postData = new FormData();
  if (queryParams.image) {
    const img = queryParams.image;
    delete queryParams.image;
    let resizedImage;
    if (img instanceof Blob) {
      resizedImage = await resizeImage(img, settings.resize_settings);
    } else if (img instanceof HTMLInputElement && img.files) {
      resizedImage = await resizeImage(img.files[0], settings.resize_settings);
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
  return sendRequest(settings.timeout, fetchObj, path, callback, failure);
};
