/* eslint-disable*/
// This file is very similar to index.js used in Node environment

(function(context, doc, element, src, objs) {
	// create stub object
	if (Array.isArray(objs)) {
		for (var i = 0; i < objs.length; i++) {
			initVisearch(context, doc, element, src, objs[i]);
		}
	} else {
		initVisearch(context, doc, element, src, objs);
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

	function initVisearch(context, doc, element, src, obj_name) {
		var __visearch_obj = context[obj_name] = context[obj_name] || {};
		__visearch_obj.q = __visearch_obj.q || [];
	
		// Define a factory to create stubs. These are placeholders
		// for methods in visearch.js so that you never have to wait
		// for it to load to actually record data. The `method` is
		// stored as the first argument, so we can replay the data.
		__visearch_obj.factory = function(method){
				return function(){
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
			'send',
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
		];
		// For each of our methods, generate a queueing stub.
		for (var i = 0; i < __visearch_obj.methods.length; i++) {
				var key = __visearch_obj.methods[i];
				__visearch_obj[key] = __visearch_obj.factory(key);
		}
	
		if (context.initVisearchFactory) {
			initVisearchFactory(context[obj_name])
		} else {
			var el = insertScript(doc, element, src);
			el.onload = function() {
				initVisearchFactory(context[obj_name])
			};
			el.onerror = function() {
				console.log('Unable to load ViSearch Javascript SDK');
			};
		}

	}
})(window, document, 'script', '../dist/js/visearch.js', 'visearch');
