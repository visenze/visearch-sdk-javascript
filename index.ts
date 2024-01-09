import { ViSearch } from './src/visearch';
import { ViSearchClient } from './types/shared.js';

(function init(context): void {
  if (typeof window !== 'undefined' && context && !context.viInit) {
    context.viInit = (context: typeof globalThis, clientName: string): ViSearchClient => {
      const client = ViSearch();
      const stub = (context as any)[clientName];
      const q = stub?.q || [];
      q.forEach((command: [keyof ViSearchClient, unknown]) => client.applyPrototypesCall(command));
      // replace the stub with the 'real' one after backcall
      (context as any)[clientName] = client;
      return client;
    };
  }
})(typeof self !== 'undefined' ? self : this);
