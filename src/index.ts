import { ViSearch } from './visearch';
import { ViSearchClient } from '../types';

(function init(context): void {
  if (typeof window === 'undefined') {
    exports.default = ViSearch;
  } else if (context && !context.viInit) {
    context.viInit = (context: any, clientName: string): ViSearchClient => {
      const client = ViSearch();
      const stub = context[clientName];
      const q = stub?.q || [];
      q.forEach((command) => client.apply_prototypes_call(command));
      // replace the stub with the 'real' one after backcall
      context[clientName] = client;
      return client;
    }
  }
}(typeof self !== 'undefined' ? self : this));
