import { sendGetRequest, sendPostRequest } from './common.js';
import { GenericCallback, ViSearchSettings } from '../types/shared';

const END_POINT_LEGACY = 'https://multimodal.search.rezolve.com';
const END_POINT_AWS    = 'https://multisearch-aw.rezolve.com';
const END_POINT_AZURE  = 'https://multisearch-az.rezolve.com';
const CN_END_POINT     = 'https://search.visenze.com.cn';

// Legacy paths
const PATH_SEARCH                    = 'v1/product/search_by_image';
const PATH_REC                       = 'v1/product/recommendations';
const PATH_MULTISEARCH               = 'v1/product/multisearch';
const PATH_MULTISEARCH_COMPLEMENTARY = 'v1/product/multisearch/complementary';
const PATH_MULTISEARCH_OUTFIT        = 'v1/product/multisearch/outfit-recommendations';
const PATH_MULTISEARCH_AUTOCOMPLETE  = 'v1/product/multisearch/autocomplete';

// Cloud paths
const CLOUD_PATH_SEARCH                    = 'v1/visearch/search_by_image';
const CLOUD_PATH_REC                       = 'v1/visearch/recommendations';
const CLOUD_PATH_MULTISEARCH               = 'v1/search';
const CLOUD_PATH_MULTISEARCH_COMPLEMENTARY = 'v1/search/complementary';
const CLOUD_PATH_MULTISEARCH_OUTFIT        = 'v1/search/outfit-recommendations';
const CLOUD_PATH_MULTISEARCH_AUTOCOMPLETE  = 'v1/autocomplete';

const CLOUD_ENDPOINTS = new Set([END_POINT_AWS, END_POINT_AZURE]);

function getAnalyticsParams(
  queryParams: Record<string, unknown> | undefined,
  vaParams?: Record<string, unknown>,
): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (vaParams) {
    params['va_uid'] = vaParams['uid'];
    params['va_sdk'] = vaParams['sdk'];
    params['va_sdk_version'] = vaParams['v'];
    // search sid will take prority over analytics sid
    params['va_sid'] = queryParams?.['va_sid'] || vaParams['sid'];
    // search uid will take prority over analytics uid
    params['va_uid'] = queryParams?.['va_uid'] || vaParams['uid'];
  }
  return params;
}

function getAuthParams(settings: ViSearchSettings): Record<string, unknown> {
  const params: Record<string, unknown> = {
    app_key: settings['app_key'],
    placement_id: settings['placement_id'],
  };
  if (!settings['placement_id'] && settings['strategy_id']) {
    params['strategy_id'] = settings['strategy_id'];
  }
  return params;
}

function getEndpoint(settings: ViSearchSettings): string {
  if (settings.endpoint) return settings.endpoint;
  if (settings['is_cn']) return CN_END_POINT;
  if (settings.cloud === 'aws') return END_POINT_AWS;
  if (settings.cloud === 'azure') return END_POINT_AZURE;
  return END_POINT_LEGACY;
}

// settings.endpoint takes priority: if set, check against known cloud domains.
// Only falls back to settings.cloud when no endpoint is provided.
function isCloudDomain(settings: ViSearchSettings): boolean {
  if (settings.endpoint) return CLOUD_ENDPOINTS.has(settings.endpoint);
  if (settings['is_cn']) return false;
  return settings.cloud === 'aws' || settings.cloud === 'azure';
}

function getQueryParams(
  params: Record<string, unknown> | undefined,
  vaParams: Record<string, unknown>,
  settings: ViSearchSettings,
): Record<string, unknown> {
  return {
    ...(params ?? {}),
    ...getAnalyticsParams(params, vaParams),
    ...getAuthParams(settings),
  };
}

function multisearch(
  settings: ViSearchSettings,
  params: Record<string, unknown>,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const path = isCloudDomain(settings) ? CLOUD_PATH_MULTISEARCH : PATH_MULTISEARCH;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), path, queryParams, callback, failure);
}

function multisearchComplementary(
  settings: ViSearchSettings,
  params: Record<string, unknown>,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const path = isCloudDomain(settings) ? CLOUD_PATH_MULTISEARCH_COMPLEMENTARY : PATH_MULTISEARCH_COMPLEMENTARY;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), path, queryParams, callback, failure);
}

function multisearchOutfitRecommendations(
  settings: ViSearchSettings,
  params: Record<string, unknown>,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const path = isCloudDomain(settings) ? CLOUD_PATH_MULTISEARCH_OUTFIT : PATH_MULTISEARCH_OUTFIT;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), path, queryParams, callback, failure);
}

function multisearchAutocomplete(
  settings: ViSearchSettings,
  params: Record<string, unknown>,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const path = isCloudDomain(settings) ? CLOUD_PATH_MULTISEARCH_AUTOCOMPLETE : PATH_MULTISEARCH_AUTOCOMPLETE;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), path, queryParams, callback, failure);
}

function searchByImage(
  settings: ViSearchSettings,
  params: Record<string, unknown>,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const path = isCloudDomain(settings) ? CLOUD_PATH_SEARCH : PATH_SEARCH;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), path, queryParams, callback, failure);
}

function searchById(
  settings: ViSearchSettings,
  productId: string,
  params: Record<string, unknown> | undefined,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const basePath = isCloudDomain(settings) ? CLOUD_PATH_REC : PATH_REC;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendGetRequest(settings, getEndpoint(settings), `${basePath}/${productId}`, queryParams, callback, failure);
}

function searchByIdByPost(
  settings: ViSearchSettings,
  productId: string,
  params: Record<string, unknown> | undefined,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback,
): Promise<void> {
  const basePath = isCloudDomain(settings) ? CLOUD_PATH_REC : PATH_REC;
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), `${basePath}/${productId}`, queryParams, callback, failure);
}

export { searchById, searchByImage, searchByIdByPost, multisearch, multisearchComplementary, multisearchOutfitRecommendations, multisearchAutocomplete };
