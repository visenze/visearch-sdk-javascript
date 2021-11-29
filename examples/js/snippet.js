// This file is very similar to index.js used in Node environment

(function(context, doc, element, src, obj_name) {
	// create stub object
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
	for (var i = 0; i < __visearch_obj.methods.length; i++) {
			var key = __visearch_obj.methods[i];
			__visearch_obj[key] = __visearch_obj.factory(key);
	}

	// create element to load javascript async
	var el = doc.createElement(element);
	el.type = 'text/javascript';
	el.async = true;
	el.src = src;
	var m = doc.getElementsByTagName(element)[0];
	m.parentNode.insertBefore(el, m);
	el.onload = function() {
		for (var i = 0; i < initFactoryArray.length; i++) {
			var initGroup = initFactoryArray[i];
			if (!initGroup.obj_name) {
				initGroup.obj_name = obj_name;
				initGroup.init(context[obj_name]);
				break;
			}
		}
	};
	el.onerror = function() {
		console.log('Unable to initialize ViSearch SDK');
	};
})(window, document, 'script', '../dist/js/visearch.js', 'visearch');


// Uncomment if you want to test multiple visearch instantiations
(function (context, doc, element, src, obj_name) {
    // create stub object
    const __visearch_obj = context[obj_name] = context[obj_name] || {};
    __visearch_obj.q = __visearch_obj.q || [];

    // Define a factory to create stubs. These are placeholders
    // for methods in visearch.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    __visearch_obj.factory = function (method) {
      return function () {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(method);
        __visearch_obj.q.push(args);
        return __visearch_obj;
      };
    };
    // A list of the methods in visearch.js to stub.
    __visearch_obj.methods = [
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
    for (let i = 0; i < __visearch_obj.methods.length; i++) {
      const key = __visearch_obj.methods[i];
      __visearch_obj[key] = __visearch_obj.factory(key);
    }
  
    // create element to load javascript async
    const el = doc.createElement(element);
    el.type = 'text/javascript';
    el.async = true;
    el.src = src;
    const m = doc.getElementsByTagName(element)[0];
    m.parentNode.insertBefore(el, m);
		el.onload = function() {
			for (var i = 0; i < initFactoryArray.length; i++) {
				var initGroup = initFactoryArray[i];
				if (!initGroup.obj_name) {
					initGroup.obj_name = obj_name;
					initGroup.init(context[obj_name]);
					break;
				}
			}
		};
		el.onerror = function() {
			console.log('Unable to initialize ViSearch SDK');
		};
  })(window, document, 'script', '../dist/js/visearch.js', 'visearch2');
