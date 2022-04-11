const { sendGetRequest, sendPostRequest } = require('./common');

const END_POINT = 'https://search.visenze.com';
const CN_END_POINT = 'https://search.visenze.com.cn';

function getEndPoint(settings) {
  if (settings.endpoint) {
    return settings.endpoint;
  }
  return settings.is_CN ? CN_END_POINT : END_POINT;
}

function getAuthParams(settings, params) {
  params.app_key = settings.app_key;
  params.placement_id = settings.placement_id;
  return params;
}

function searchbyimage(settings, params, vaParams, options, callback, failure) {
  return sendPostRequest(settings, getEndPoint(settings), 'v1/product/search_by_image', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function searchbyid(settings, productId, params, vaParams, options, callback, failure) {
  return sendGetRequest(settings, getEndPoint(settings), `v1/product/recommendations/${productId}`, vaParams, getAuthParams(settings, params), options, callback, failure);
}

function searchbyidbypost(settings, productId, params, vaParams, options, callback, failure) {
  return sendPostRequest(settings, getEndPoint(settings), `v1/product/recommendations/${productId}`, vaParams, getAuthParams(settings, params), options, callback, failure);
}

module.exports = {
  searchbyid, searchbyimage, searchbyidbypost,
};
