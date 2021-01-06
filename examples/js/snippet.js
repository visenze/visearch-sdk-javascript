// This file is very similar to index.js used in Node environment

(function(context, doc, element, src, obj_name) {
    context['__visearch_obj'] = obj_name;
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
        'product_search',
        'product_visuallysimilar'
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
})(window, document, 'script', '../dist/js/visearch.js', 'visearch');
