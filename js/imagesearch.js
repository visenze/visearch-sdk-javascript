/* eslint-disable max-len */
const { sendGetRequest, sendPostRequest } = require('./common');

const END_POINT = 'https://visearch.visenze.com/';
const CN_END_POINT = 'https://visearch.visenze.com.cn/';

function getEndPoint(settings) {
  if (settings.endpoint) {
    return settings.endpoint;
  }
  return settings.is_CN ? CN_END_POINT : END_POINT;
}

function getAuthParams(settings, params) {
  params.access_key = settings.app_key;
  return params;
}

function search(settings, params, vaParams, options, callback, failure) {
  return sendGetRequest(settings, getEndPoint(settings), 'search', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function recommendation(settings, params, vaParams, options, callback, failure) {
  return sendGetRequest(settings, getEndPoint(settings), 'recommendation', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function similarproducts(settings, params, vaParams, options, callback, failure) {
  return sendPostRequest(settings, getEndPoint(settings), 'similarproducts', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function outofstock(settings, params, vaParams, options, callback, failure) {
  return sendGetRequest(settings, getEndPoint(settings), 'out_of_stock', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function uploadsearch(settings, params, vaParams, options, callback, failure) {
  return sendPostRequest(settings, getEndPoint(settings), 'uploadsearch', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function discoversearch(settings, params, vaParams, options, callback, failure) {
  return sendPostRequest(settings, getEndPoint(settings), 'discoversearch', vaParams, getAuthParams(settings, params), options, callback, failure);
}

function colorsearch(settings, params, vaParams, options, callback, failure) {
  return sendGetRequest(settings, getEndPoint(settings), 'colorsearch', vaParams, getAuthParams(settings, params), options, callback, failure);
}

module.exports = {
  search, recommendation, similarproducts, outofstock, uploadsearch, discoversearch, colorsearch,
};
