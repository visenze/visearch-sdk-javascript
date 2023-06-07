import { ViSearch } from './visearch.js';
import {
  ViSearchClient,
  GenericCallback,
  ViSearchSettings,
  SimpleResponse,
  ProductSearchResponse,
  ProductSearchResponseError,
  ProductSearchResponseSuccess,
  ProductSearchResponseResult,
  ProductSearchResponseObject,
  ProductSearchResponseGeneral,
  SetInfo,
  GroupProductResponse,
  Product,
  ObjectProductResponse,
  ProductType,
  ResizeSettings,
  FacetItem,
  FacetRange,
  Facet,
} from '../types/shared';

(function init(context): void {
  if (typeof window !== 'undefined' && context && !context.viInit) {
    context.viInit = (context: typeof globalThis, clientName: string): ViSearchClient => {
      const client = ViSearch();
      const stub = (context as any)[clientName];
      const q = stub?.q || [];
      q.forEach((command: [keyof ViSearchClient, unknown]) => client.apply_prototypes_call(command));
      // replace the stub with the 'real' one after backcall
      (context as any)[clientName] = client;
      return client;
    };
  }
})(typeof self !== 'undefined' ? self : this);

export default ViSearch;
export {
  ViSearchClient,
  GenericCallback,
  ViSearchSettings,
  SimpleResponse,
  ProductSearchResponse,
  ProductSearchResponseError,
  ProductSearchResponseSuccess,
  ProductSearchResponseResult,
  ProductSearchResponseObject,
  ProductSearchResponseGeneral,
  SetInfo,
  GroupProductResponse,
  Product,
  ObjectProductResponse,
  ProductType,
  ResizeSettings,
  FacetItem,
  FacetRange,
  Facet,
};
