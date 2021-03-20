const { sendGetRequest, sendPostRequest } = require('./common');

const END_POINT = 'https://search-dev.visenze.com';
const CN_END_POINT = 'https://search-dev.visenze.com.cn';

class ProductSearch {
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
    params.app_key = this.settings.app_key;
    params.placement_id = this.settings.placement_id;
    return params;
  }

  searchbyimage(params, vaParams, options, callback, failure) {
    return sendPostRequest(this.settings, this.getEndPoint(), 'v1/product/search_by_image', vaParams, this.getAuthParams(params), options, callback, failure);
  }

  searchbyid(productId, params, vaParams, options, callback, failure) {
    return sendGetRequest(this.settings, this.getEndPoint(), `v1/product/search_by_id/${productId}`, vaParams, this.getAuthParams(params), options, callback, failure);
  }
}

module.exports = ProductSearch;
