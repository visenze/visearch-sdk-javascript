/* eslint-disable*/
// This file is to generate the script for webpage
(function (context, doc, element, src, objs) {
  // create stub object
  if (Array.isArray(objs)) {
    for (var i = 0; i < objs.length; i++) {
      getStub(context, doc, element, src, objs[i]);
    }
  } else {
    getStub(context, doc, element, src, objs);
  }

  function insertScript(doc, element, src) {
    // create element to load javascript async
    var el = doc.createElement(element);
    el.type = 'text/javascript';
    el.async = true;
    el.src = src;
    var m = doc.getElementsByTagName(element)[0];
    m.parentNode.insertBefore(el, m);
    return el;
  }

  function getStub(context, doc, element, src, obj_name) {
    var __visearch_obj = context[obj_name] || {};
    context[obj_name] = __visearch_obj;
    __visearch_obj.q = __visearch_obj.q || [];

    // Define a factory to create stubs. These are placeholders
    // for methods in visearch.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    __visearch_obj.factory = function (method) {
      return function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(method);
        __visearch_obj.q.push(args);
        return __visearch_obj;
      };
    };
    // A list of the methods in visearch.js to stub.
    __visearch_obj.methods = [
      'set',
      'setKeys',
      'sendEvent',
      'sendEvents',
      'productMultisearch',
      'productMultisearchAutocomplete',
      'productSearchByImage',
      'productSearchById',
      'productRecommendations',
      'productSearchByIdByPost',
      'productRecommendationsByPost',
      'setUid',
      'getUid',
      'getSid',
      'getLastQueryId',
      'getSessionTimeRemaining',
      'getDefaultTrackingParams',
      'resetSession',
      'resizeImage',
      'generateUuid',
    ];
    // For each of our methods, generate a queueing stub.
    for (var i = 0; i < __visearch_obj.methods.length; i++) {
      var key = __visearch_obj.methods[i];
      __visearch_obj[key] = __visearch_obj.factory(key);
    }

    if (context.viInit) {
      viInit(context, obj_name);
    } else {
      var el = insertScript(doc, element, src);
      el.onload = function () {
        viInit(context, obj_name);
      };
      el.onerror = function () {
        console.log('ViSearch Javascript SDK load fails');
      };
    }
  }
})(window, document, 'script', '/dist/visearch.js', 'visearch');
