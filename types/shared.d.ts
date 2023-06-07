export type GenericCallback = (...arg: any) => void;

export interface ViSearchClient {
  q: any;
  set: (key: string, value: unknown) => void;
  set_keys: (keys: Record<string, unknown>) => void;
  send: (
    action: string,
    eventParams: Record<string, unknown>,
    callback?: (action: string, params: Record<string, unknown>) => void,
    failure?: GenericCallback
  ) => void;
  send_events: (
    action: string,
    eventParamsList: Record<string, unknown>[],
    callback?: () => void,
    failure?: GenericCallback
  ) => void;
  product_search_by_image: (
    params: Record<string, unknown>,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  product_search_by_id: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  product_recommendations: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  product_recommendations_by_post: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  product_search_by_id_by_post: (
    pid: string,
    params: Record<string, unknown>,
    callback: (resp: PSResponse) => void,
    failure?: GenericCallback
  ) => Promise<void>;
  set_uid: (uid: string, callback?: (uid: string) => void, failure?: GenericCallback) => void;
  get_uid: (callback: (uid: string) => void, failure?: GenericCallback) => void;
  get_sid: (callback: (sid: string) => void, failure?: GenericCallback) => void;
  get_last_query_id: (callback: (lastQueryId: string | null) => void, failure?: GenericCallback) => void;
  get_session_time_remaining: (callback: (time: number) => void, failure?: GenericCallback) => void;
  reset_session: (callback?: (sid: string) => void, failure?: GenericCallback) => void;
  get_default_tracking_params: (callback: (params: Record<string, unknown>) => void, failure?: GenericCallback) => void;
  apply_prototypes_call: (command: [keyof ViSearchClient, unknown]) => void;
  resize_image: (
    imageAsDataUrl: string,
    resizeSettings: PSResizeSettings | undefined,
    onSuccess: (dataUrl: null | string) => void,
    onFailure?: GenericCallback
  ) => Promise<void>;
  generate_uuid: (callback: (uuid: string) => void, failure?: GenericCallback) => void;
}

export type ViSearchSettings = {
  app_key: string;
  placement_id: string;
  uid?: string;
  analytics_endpoint?: string;
  endpoint?: string;
  timeout?: number;
  resize_settings?: PSResizeSettings;
  [key: string]: unknown;
};

export type PSResponse = PSResponseSuccess | PSResponseError;

export type PSResponseSuccess = PSResponseSuccessResult | PSResponseSuccessObject;

export interface PSResponseError {
  reqid: string;
  status: 'fail';
}

export interface PSResponseSuccessGeneral {
  reqid: string;
  status: 'OK';
  method: string;
  page?: number;
  limit?: number;
  total?: number;
  product_types?: any[];
  experiment?: {
    experiment_no_recommendation?: boolean;
  };
  experiment_no_recommendation?: boolean;
}

export interface PSResponseSuccessResult extends PSResponseSuccessGeneral {
  result: PSProduct[];
}

export interface PSResponseSuccessObject extends PSResponseSuccessGeneral {
  objects: PSObject[];
}

export interface PSProduct {
  product_id: string;
  main_image_url: string;
  data: Record<string, unknown>;
  score?: number;
  image_s3_url?: string;
  pinned?: boolean;
}

export interface PSObject {
  score?: number;
  box: [number, number, number, number];
  id: string;
  category: string;
  name?: string;
  total?: number;
  result: PSProduct[];
}

export interface PSResizeSettings {
  maxWidth: number;
  maxHeight: number;
}

declare global {
  interface Window {
    vsPlacementLoaded: Record<string, boolean>;
    dataLayer?: any[];
    viInit?: (context: typeof globalThis, clientName: string) => ViSearchClient;
  }
  var viInit: (context: typeof globalThis, clientName: string) => ViSearchClient;
}
