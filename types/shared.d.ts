import { VAClient } from 'visenze-tracking-javascript';

export type GenericCallback = (...arg: any) => void;

export interface ViSearchClient {
  q: any;
  set: (key: string, value: unknown) => void;
  setKeys: (keys: Record<string, unknown>) => void;
  sendEvent: VAClient['sendEvent'];
  sendEvents: VAClient['sendEvents'];
  productMultisearch: (
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productMultisearchComplementary: (
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productMultisearchOutfitRecommendations: (
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productMultisearchAutocomplete: (
    params: Record<string, unknown>,
    callback: (resp: AutoCompleteResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productSearchByImage: (
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productSearchById: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productRecommendations: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productRecommendationsByPost: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
  ) => Promise<void>;
  productSearchByIdByPost: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: ProductSearchResponse) => void,
    failure?: GenericCallback,
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
    onFailure?: GenericCallback,
  ) => Promise<void>;
  generateUuid: (callback: (uuid: string) => void, failure?: GenericCallback) => void;
}

export type ViSearchSettings = {
  app_key: string;
  placement_id: string;
  cloud?: 'aws' | 'azure';
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
export type AutoCompleteResponse = AutoCompleteResponseSuccess | ProductSearchResponseError;

export interface AutoCompleteResponseSuccess extends SimpleResponse {
  status: 'OK';
  result?: AutoCompleteResultItem[];
}

export interface AutoCompleteResultItem {
  text: string;
  score: number;
}

export interface ProductSearchResponseError extends SimpleResponse {
  status: 'fail';
  error: {
    code: number;
    message: string;
  };
  /** The steps the search went through, when the request sets `return_trace: true`. See SearchTrace. */
  trace?: SearchTrace;
}

/**
 * The steps a multisearch went through, returned when the request sets `return_trace: true`. A debugging
 * aid: the steps and their details change as the search pipeline changes, so treat them as data to show,
 * not a contract to code against.
 */
export interface SearchTrace {
  /** Time the whole search took, in milliseconds. */
  total_ms: number;
  /** Steps in the order they started; some run at the same time. */
  steps: SearchTraceStep[];
}

export interface SearchTraceStep {
  /** The step's name, e.g. `similarity_search` or `boosting`. */
  step: string;
  /** The sub-search the step belongs to, e.g. `pairing_rule:0` or `outfit_object:1`; absent for the request's own steps. */
  group?: string;
  /** When the step started, in milliseconds from the start of the search. */
  start_ms: number;
  duration_ms: number;
  /** True when the step failed and the search carried on without it. */
  failed?: boolean;
  /** What the step did, in a sentence for people to read. */
  summary?: string;
  /** The step's own fields, e.g. candidate counts or the query before and after. */
  details?: Record<string, unknown>;
}

export interface ProductSearchResponseSuccess extends SimpleResponse {
  status: 'OK';
  page?: number;
  limit?: number;
  total?: number;
  im_id?: string;
  debug?: { [index: string]: any };
  /** The steps the search went through, when the request sets `return_trace: true`. See SearchTrace. */
  trace?: SearchTrace;
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
  qinfo?: Product;
  query_sys_meta?: { [index: string]: string };
  query_tmp_url?: string;
  excluded_pids?: string[];
  experiment?: {
    experiment_no_recommendation?: boolean;
  };
  experiment_no_recommendation?: boolean;
  result?: Product[];
  objects?: ObjectProductResponse[];
  [key: string]: unknown;
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

export interface BestImage {
  type: string;
  url: string;
  index: string;
}

export interface Product {
  product_id: string;
  main_image_url: string;
  data: Record<string, unknown>;
  sys?: Record<string, unknown>;
  /** Other products paired with this result by pairing-rule search APIs (e.g. outfit recommendations, complementary search). See CONTEXT.md. */
  alternatives?: Product[];
  /** Other products collapsed into this result by a backend deduping mechanism, distinct from `alternatives` and from this SDK's `group_by_key`/`group_results` feature. See CONTEXT.md. */
  variants?: Product[];
  score?: number;
  image_s3_url?: string;
  pinned?: 'true' | 'false';
  best_images?: BestImage[];
  [key: string]: unknown;
}

export interface ObjectProductResponse extends ProductType {
  id: string;
  category?: string;
  name?: string;
  excluded_pids?: string[];
  total?: number;
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

/* eslint-disable no-var */
declare global {
  interface Window {
    vsPlacementLoaded: Record<string, boolean>;
    dataLayer?: any[];
    viInit?: (context: typeof globalThis, clientName: string) => ViSearchClient;
  }
  var viInit: (context: typeof globalThis, clientName: string) => ViSearchClient;
}
/* eslint-enable no-var */
