import { sendGetRequest, sendPostRequest } from './common.js';
import { GenericCallback, ViSearchSettings } from '../types/shared';

const END_POINT = 'https://search.visenze.com';
const CN_END_POINT = 'https://search.visenze.com.cn';

const PATH_SEARCH = 'v1/product/search_by_image';
const PATH_REC = 'v1/product/recommendations';

function getAnalyticsParams(
  queryParams: Record<string, unknown> | undefined,
  vaParams?: Record<string, unknown>
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
    app_key: ['app_key'],
    placement_id: settings['placement_id'],
  };
  if (!settings['placement_id'] && settings['strategy_id']) {
    params['strategy_id'] = settings['strategy_id'];
  }
  return params;
}

function getEndpoint(settings: ViSearchSettings): string {
  if (settings.endpoint) {
    return settings.endpoint;
  }
  return settings['is_cn'] ? CN_END_POINT : END_POINT;
}

function getQueryParams(
  params: Record<string, unknown> | undefined,
  vaParams: Record<string, unknown>,
  settings: ViSearchSettings
): Record<string, unknown> {
  return {
    ...(params ?? {}),
    ...getAnalyticsParams(params, vaParams),
    ...getAuthParams(settings),
  };
}

function searchByImage(
  settings: ViSearchSettings,
  params: Record<string, unknown>,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback
): Promise<void> {
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), PATH_SEARCH, queryParams, callback, failure);
}

function searchById(
  settings: ViSearchSettings,
  productId: string,
  params: Record<string, unknown> | undefined,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback
): Promise<void> {
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendGetRequest(settings, getEndpoint(settings), `${PATH_REC}/${productId}`, queryParams, callback, failure);
}

function searchByIdByPost(
  settings: ViSearchSettings,
  productId: string,
  params: Record<string, unknown> | undefined,
  vaParams: Record<string, unknown>,
  callback?: GenericCallback,
  failure?: GenericCallback
): Promise<void> {
  const queryParams = getQueryParams(params, vaParams, settings);
  return sendPostRequest(settings, getEndpoint(settings), `${PATH_REC}/${productId}`, queryParams, callback, failure);
}

export { searchById, searchByImage, searchByIdByPost };
