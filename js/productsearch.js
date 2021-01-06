const { sendGetRequest, sendPostRequest } = require('./common');

const END_POINT = 'https://search.visenze.com/v1/';

class ProductSearch {
	constructor() {
		this.settings = {};
	}

	set(key, val) {
		this.settings[key] = val; 
  }
  
  getAuthParams(params) {
    params.app_key = this.settings.app_key;
    params.placement_id = this.settings.placement_id;
		return params;
	}

	search(params, vaParams, options, callback, failure) {
		return sendPostRequest(this.settings, END_POINT, 'similar-products', vaParams, params, options, callback, failure);
	}

	visuallysimilar(productId, params, vaParams, options, callback, failure) {
		return sendGetRequest(this.settings, END_POINT, `similar-products/${productId}`, vaParams, params, options, callback, failure);
	}

};

module.exports = ProductSearch;