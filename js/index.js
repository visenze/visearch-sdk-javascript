const ViSearch = require('./visearch');

function visearch(settings) {
  this.visearch = new ViSearch();
  this.visearch.q = this.visearch.q || [];

  // Define a factory to create stubs. These are placeholders for methods in visearch.js
  // so that you never have to wait for it to load to actually record data.
  // The `method` is stored as the first argument, so we can replay the data.
  this.visearch.factory = function factory(method, visearchObj) {
    return function visearchFactory(...args) {
      args.unshift(method);
      visearchObj.q.push(args);
      return visearchObj;
    };
  };

  // A list of the methods in visearch.js to stub.
  // We need to maintain backward compatibility so the method names remain the same for imagesearch
  this.visearch.methods = [
    'set',
    'setKeys',
    'send',
    'send_events',
    'product_search_by_image',
    'product_search_by_id',
    'product_recommendations',
    'product_search_by_id_by_post',
    'product_recommendations_by_post',
    'set_uid',
    'get_uid',
    'get_sid',
    'get_query_id',
    'get_session_time_remaining',
    'get_default_tracking_params',
    'reset_session',
    'resize_image',
    'generate_uuid',
  ];

  // For each of our methods, generate a queueing stub.
  for (let i = 0; i < this.visearch.methods.length; i += 1) {
    const key = this.visearch.methods[i];
    this.visearch[key] = this.visearch.factory(key, this.visearch);
  }

  if (settings) {
    this.visearch.setKeys(settings);
  }
}

module.exports = visearch;
