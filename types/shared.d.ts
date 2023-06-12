import { VAClient } from 'visenze-tracking-javascript';

export type GenericCallback = (...arg: any) => void;

export interface ViSearchClient {
  q: any;
  set: (key: string, value: unknown) => void;
  setKeys: (keys: Record<string, unknown>) => void;
  sendEvent: VAClient['sendEvent'],
  sendEvents: VAClient['sendEvents'],
  productSearchByImage: (
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  productSearchById: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  productRecommendations: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  productRecommendationsByPost: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  productSearchByIdByPost: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  setUid: (uid: string, callback?: (uid: string) => void, failure?: GenericCallback) => void;
  getUid: (callback: (uid: string) => void, failure?: GenericCallback) => void;
  getSid: (callback: (sid: string) => void, failure?: GenericCallback) => void;
  getLastQueryId: (callback: (lastQueryId: string | null) => void, failure?: GenericCallback) => void;
  getSessionTimeRemaining: (callback: (time: number) => void, failure?: GenericCallback) => void;
  resetSession: (callback?: (sid: string) => void, failure?: GenericCallback) => void;
  getDefaultTrackingParams: (callback: (params: Record<string, unknown>) => void, failure?: GenericCallback) => void;
  applyPrototypesCall: (command: [keyof ViSearchClient, unknown]) => void;
  resizeImage: (
    imageAsDataUrl: string,
    resizeSettings: ResizeSettings | undefined,
    onSuccess: (dataUrl: null | string) => void,
    onFailure?: GenericCallback
  ) => Promise<void>;
  generateUuid: (callback: (uuid: string) => void, failure?: GenericCallback) => void;
}

export type ViSearchSettings = {
  app_key: string;
  placement_id: string;
  uid?: string;
  analytics_endpoint?: string;
  endpoint?: string;
  timeout?: number;
  resize_settings?: ResizeSettings;
  [key: string]: unknown;
};

export interface SimpleResponse {
  reqid: string;
  status: string;
  method: string;
}

export type ProductSearchResponse = ProductSearchResponseSuccess | ProductSearchResponseError;

export type ProductSearchResponseSuccess = ProductSearchResponseResult | ProductSearchResponseObject;

export interface ProductSearchResponseError extends SimpleResponse {
  status: 'fail';
  error: {
    code: number;
    message: string;
  };
}

export interface ProductSearchResponseGeneral extends SimpleResponse {
  status: 'OK';
  page?: number;
  limit?: number;
  total?: number;
  im_id?: string;
  debug?: { [index: string]: any };
  product_types?: ProductType[];
  group_by_key?: string;
  group_limit?: number;
  group_results?: GroupProductResponse[];
  set_info?: SetInfo[];
  catalog_fields_mapping?: { [index: string]: string };
  facets?: Facet[];
  explanation?: { [index: string]: any };
  alt_limit?: number;
  product_info?: Product;
  query_sys_meta?: { [index: string]: string };
  query_tmp_url?: string;
  excluded_pids?: string[];
  experiment?: {
    experiment_no_recommendation?: boolean;
  };
  experiment_no_recommendation?: boolean;
  [key: string]: unknown;
}

export interface ProductSearchResponseResult extends ProductSearchResponseGeneral {
  result: Product[];
}

export interface ProductSearchResponseObject extends ProductSearchResponseGeneral {
  objects: ObjectProductResponse[];
}

export interface SetInfo {
  set_id: string;
  set_score: number;
  item_count: number;
}

export interface GroupProductResponse {
  group_by_value: string;
  result: Product[];
}

export interface Product {
  product_id: string;
  main_image_url: string;
  data: Record<string, unknown>;
  score?: number;
  image_s3_url?: string;
  pinned?: boolean;
  [key: string]: unknown;
}

export interface ObjectProductResponse extends ProductType {
  id: string;
  category: string;
  name: string;
  excluded_pids?: string[];
  total: number;
  result: Product[];
  facets?: Facet[];
  group_results?: GroupProductResponse[];
}

export interface ProductType {
  type: string;
  score?: number;
  rerankScore?: number;
  box: number[];
  attributes: { [index: string]: string[] };
  box_type: string;
}

export interface ResizeSettings {
  maxWidth: number;
  maxHeight: number;
}

export interface FacetItem {
  count?: number;
  value: string;
}

export interface FacetRange {
  min: number;
  max: number;
}

export interface Facet {
  key: string;
  items: FacetItem[];
  range?: FacetRange;
}

declare global {
  interface Window {
    vsPlacementLoaded: Record<string, boolean>;
    dataLayer?: any[];
    viInit?: (context: typeof globalThis, clientName: string) => ViSearchClient;
  }
  var viInit: (context: typeof globalThis, clientName: string) => ViSearchClient;
}
