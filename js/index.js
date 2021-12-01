// Entry file for Node.js environments.

// Import ViSearch
const visearch = require('./visearch');

visearch.q = visearch.q || [];

// Define a factory to create stubs. These are placeholders for methods in visearch.js
// so that you never have to wait for it to load to actually record data.
// The `method` is stored as the first argument, so we can replay the data.
visearch.factory = function (method) {
  return function () {
    const args = Array.prototype.slice.call(arguments);
    args.unshift(method);
    visearch.q.push(args);
    return visearch;
  };
};

// A list of the methods in visearch.js to stub.
// We need to maintain backward compatibility so the method names remain the same for image search 
visearch.methods = [
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
  'set_uid',
  'get_uid',
  'get_sid',
  'get_session_time_remaining',
  'reset_session',
];

// For each of our methods, generate a queueing stub.
for (let i = 0; i < visearch.methods.length; i += 1) {
  const key = visearch.methods[i];
  visearch[key] = visearch.factory(key);
}

module.exports = visearch;
