// Entry file for Node.js environments.

// Import ViSearch
const ViSearch = require('./visearch');

function visearch() {
  this.visearch = new ViSearch();
  this.visearch.q = this.visearch.q || [];

  // Define a factory to create stubs. These are placeholders for methods in visearch.js
  // so that you never have to wait for it to load to actually record data.
  // The `method` is stored as the first argument, so we can replay the data.
  this.visearch.factory = function (method, visearch) {
    return function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      visearch.q.push(args);
      return visearch;
    };
  };

  // A list of the methods in visearch.js to stub.
  // We need to maintain backward compatibility so the method names remain the same for imagesearch
  this.visearch.methods = [
    'idsearch',
    'uploadsearch',
    'colorsearch',
    'set',
    'send',
    'search',
    'recommendation',
    'out_of_stock',
    'similarproducts',
    'discoversearch',
    'product_search_by_image',
    'product_search_by_id',
    'product_recommendations',
    'product_search_by_id_by_post',
    'product_recommendations_by_post',
    'set_uid',
    'get_uid',
    'get_sid',
    'get_session_time_remaining',
    'reset_session',
  ];

  // For each of our methods, generate a queueing stub.
  for (let i = 0; i < this.visearch.methods.length; i += 1) {
    const key = this.visearch.methods[i];
    this.visearch[key] = this.visearch.factory(key, this.visearch);
  }
}

module.exports = visearch;
