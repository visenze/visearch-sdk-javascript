const { sendGetRequest, sendPostRequest } = require('./common');

const END_POINT = 'https://visearch.visenze.com/';
const CN_END_POINT = 'https://visearch.visenze.com.cn/';

class ImageSearch {
  constructor() {
    this.settings = {};
  }

  set(key, val) {
    this.settings[key] = val;
  }

  getEndPoint() {
    if (this.settings.endpoint) {
      return this.settings.endpoint;
    }
    return this.settings.is_CN ? CN_END_POINT : END_POINT;
  }

  getAuthParams(params) {
    params.access_key = this.settings.app_key;
    return params;
  }

  search(params, vaParams, options, callback, failure) {
    return sendGetRequest(this.settings, this.getEndPoint(), 'search', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  recommendation(params, vaParams, options, callback, failure) {
    return sendGetRequest(this.settings, this.getEndPoint(), 'recommendation', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  similarproducts(params, vaParams, options, callback, failure) {
    return sendPostRequest(this.settings, this.getEndPoint(), 'similarproducts', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  // eslint-disable-next-line camelcase
  out_of_stock(params, vaParams, options, callback, failure) {
    return sendGetRequest(this.settings, this.getEndPoint(), 'out_of_stock', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  uploadsearch(params, vaParams, options, callback, failure) {
    return sendPostRequest(this.settings, this.getEndPoint(), 'uploadsearch', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  discoversearch(params, vaParams, options, callback, failure) {
    return sendPostRequest(this.settings, this.getEndPoint(), 'discoversearch', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  colorsearch(params, vaParams, options, callback, failure) {
    return sendGetRequest(this.settings, this.getEndPoint(), 'colorsearch', vaParams, this.getAuthParams(params), options, callback, failure);
  }
}

module.exports = ImageSearch;
