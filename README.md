# visearch-javascript-sdk

[![npm version](https://img.shields.io/npm/v/visearch-javascript-sdk.svg?style=flat)](https://www.npmjs.com/package/visearch-javascript-sdk)

ViSenze's Javascript SDK provides accurate, reliable and scalable image search APIs within our catalogs. The APIs included in this SDK aims to provide developers with endpoints that executes image search efficiently while also making it easy to integrate into webapps.

> Note: In order to use any of our SDKs, you are required to have a ViSenze developer account. You will gain access to your own dashboard to manage your appkeys and catalogs. Visit [here](https://console.visenze.com) for more info.

----

## Table of Contents

- [visearch-javascript-sdk](#visearch-javascript-sdk)
  - [Table of Contents](#table-of-contents)
  - [1. Quickstart](#1-quickstart)
    - [1.1 Installation](#11-installation)
    - [1.2 Setup](#12-setup)
    - [1.3 Demo](#13-demo)
  - [2. API](#2-api)
    - [2.1 Search by Image](#21-search-by-image)
    - [2.2 Recommendations](#22-recommendations)
  - [3. Search Results](#3-search-results)
    - [3.1 ErrorData](#31-errordata)
    - [3.2 ProductType](#32-producttype)
    - [3.3 Product](#33-product)
      - [3.3.1 Data](#331-data)
    - [3.4 ProductObject](#34-productobject)
    - [3.5 Facet](#35-facet)
    - [3.6 FacetItem](#36-facetitem)
    - [3.7 FacetRange](#37-facetrange)
  - [4. Advanced Search Parameters](#4-advanced-search-parameters)
    - [4.1 Example - Retrieving Metadata](#41-example---retrieving-metadata)
    - [4.2 Example - Filtering Results](#42-example---filtering-results)
    - [4.3 Example - Automatic Object Recognition](#43-example---automatic-object-recognition)
  - [5. Event Tracking](#5-event-tracking)
    - [5.1 Setup Tracking](#51-setup-tracking)
    - [5.2 Send Events](#52-send-events)
      - [5.2.1 Getting session Id](#521-getting-session-id)
      - [5.2.2 Getting user Id](#522-getting-user-id)
      - [5.2.3 Getting query Id](#523-getting-query-id)
    - [5.2 Send Batch Events](#52-send-batch-events)
  - [6. Resize settings](#6-resize-settings)

----

## 1. Quickstart

Follow these simple steps to get familiarized with how the SDK can be integrated and how it actually works by exploring our demos included in the main [repo](https://github.com/visenze/visearch-sdk-javascript).

### 1.1 Installation

If you are using the project provided directly from the main [repo](https://github.com/visenze/visearch-sdk-javascript), you can simply run the following command from the root directory of this project:

```linux
npm install
```

If you are trying to include this SDK into your own project via npm, run the following command from the root directory of your project:

```linux
npm install visearch-javascript-sdk
```

### 1.2 Setup

#### 1.2.1 Import and initialization

- In Node
  
  ```javascript
  import ViSearch from 'visearch-javascript-sdk';

  ...
  
  const visearch = ViSearch();
  ```

  - Create multiple instances

  If you have multiple placements or if you want to run placements with different configurations, you would need to create multiple ViSearch instances.

    ```javascript
    const visearch1 = ViSearch();
    const visearch2 = ViSearch();
    ```

- In browser

  If you wish to include the SDK directly onto your webpage, add this to the header of your site

  ```html
  <script type="text/javascript">
  !function(e,t,r,s,i){if(Array.isArray(i))for(var a=0;a<i.length;a++)n(e,t,r,s,i[a]);else n(e,t,r,s,i);function n(e,t,r,s,i){var a=e[i]||{};e[i]=a,a.q=a.q||[],a.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);return t.unshift(e),a.q.push(t),a}},a.methods=["set","set_keys","send","send_events","product_search_by_image","product_search_by_id","product_recommendations","product_search_by_id_by_post","product_recommendations_by_post","set_uid","get_uid","get_sid","get_last_query_id","get_session_time_remaining","get_default_tracking_params","reset_session","resize_image","generate_uuid",];for(var n=0;n<a.methods.length;n++){var o=a.methods[n];a[o]=a.factory(o)}if(e.viInit)viInit(e,i);else{var c,d,u,f,p,g=(c=t,d=r,u=s,(f=c.createElement(d)).type="text/javascript",f.async=!0,f.src=u,(p=c.getElementsByTagName(d)[0]).parentNode.insertBefore(f,p),f);g.onload=function(){viInit(e,i)},g.onerror=function(){console.log("ViSearch Javascript SDK load fails")}}}}(window,document,"script","https://cdn.visenze.com/visearch/dist/js/visearch-4.0.0.min.js","visearch");
  </script>
  ```

  - Create multiple instances

  Copy the same code but change the keyword "visearch" into an array of your desired instances names.

    ```html
    <script type="text/javascript">
    ...(window,document,"script",0,["visearch", "visearch2"]);
    </script>
    ```

#### 1.2.2 Configure keys

Before you can start using the SDK, you will need to set up . Most of these keys can be found in your account's [dashboard](https://console.visenze.com).

Please take a look at the table below to understand what each key represents:

| Key | Importance | Description |
|:---|:---|:---|
| app_key | Compulsory | All SDK functions depends on a valid app_key being set. The app key also limits the API features you can use. |
| placement_id | Compulsory | Placement id of the current placement |
| endpoint | Situational | Default is `https://search.visenze.com/` |
| timeout | Optional | Defaulted to 15000 |
| uid | Optional | If this is not provided, we will auto generate the uid |


Set up the ViSearch instance(s) with the keys from console.

```javascript
visearch.set('app_key', 'YOUR_APP_KEY');
visearch.set('placement_id', 'YOUR_PLACEMENT_ID');
visearch.set('timeout', TIMEOUT_INTERVAL_IN_MS);
```

or

```javascript
visearch.set_keys({
  'app_key': 'YOUR_APP_KEY',
  'placement_id': 'YOUR_PLACEMENT_ID'
});
visearch2.set_keys({
  'app_key': 'YOUR_APP_KEY_2',
  'placement_id': 'YOUR_PLACEMENT_ID_2'
});
```

or

if you are in a Node env, you can pass the configs in directly when creating the ViSearch client.
```javascript
const visearch = ViSearch({
  'app_key': 'YOUR_APP_KEY',
  'placement_id': 'YOUR_PLACEMENT_ID'
})
```

### 1.3 Demo

The demo is only applicable to those who work directly off the main [repo](https://github.com/visenze/visearch-sdk-javascript). You are required to have a Node.js environment and remember to **fill up the relevant files**.

  > Create a `.env` file and fill in the relevant app key and placement id

- To run the webpage demo:
  
  ```javascript
  npm run start-demo
  ```

  After the above command, you should see that the server is running locally on your device. You can then access the different demo webpages in your browser by using this format `http://localhost:3000/examples/*.html`.

  - E.g. Product recommendation:

    `http://localhost:3000/examples/product_search_by_id.html`

  - E.g. Product search by image:

    `http://localhost:3000/examples/product_search_by_image.html`

  - E.g. Tracking:

  `http://localhost:3000/examples/tracking.html`

## 2. API

### 2.1 Search by Image

POST /product/search_by_image

Searching by Image can happen in three different ways - by url, id or File.

- Using image id:

  ```javascript
  const parameters = {
    im_id: 'your-image-id'
  };

  const onResponse = (response)=> {
    // TODO handle response
  }

  const onError = (error)=> {
    // TODO handle error
  }

  visearch.product_search_by_image(parameters, onResponse, onError);
  ```

- Using image url:

  ```javascript
  const parameters = {
    im_url: 'your-image-url'
  };

  const onResponse = (response)=> {
    // TODO handle response
  }

  const onError = (error)=> {
    // TODO handle error
  }

  visearch.product_search_by_image(parameters, onResponse, onError);
  ```

- Using image file:

  ```html
  <form>
    Upload image: <input type="file" id="fileUpload" name="fileInput"><br>
    <input type="submit" value="Submit">
  </form>
  ```

  ```javascript
  const parameters = {
    image: document.getElementById('fileUpload')
  };

  const onResponse = (response)=> {
    // TODO handle response
  }

  const onError = (error)=> {
    // TODO handle error
  }

  visearch.product_search_by_image(parameters, onResponse, onError);
  ```

> The request parameters for this API can be found at [ViSenze Documentation Hub](https://ref-docs.visenze.com/reference/search-by-image-api-1).

### 2.2 Recommendations

GET /product/recommendations/{product_id}

Search for visually similar products in the product database giving an indexed product’s unique identifier.

```javascript
const product_id = 'your-product-id';

const parameters = {
};

const onResponse = (response)=> {
  // TODO handle response
}

const onError = (error)=> {
  // TODO handle error
}

visearch.product_recommendations(product_id, parameters, onResponse, onError);
```

> The request parameters for this API can be found at [ViSenze Documentation Hub](https://ref-docs.visenze.com/reference/search-by-image-api-1).

## 3. Search Results

Javascript does not contain type definitions and the REST API response for all our APIs will instead just convert straight into javascript objects. Here are some of the [API](#2-api)'s response object's keys to take note of:

| Name | Type | Description |
|:---|:---|:---|
| status | string | The request status, either `OK`, `warning`, or `fail` |
| imId | string | Image ID. Can be used to search again without reuploading |
| im_id | string |  |
| error | [object](#31-errordata) | Error message and code if the request was not successful i.e. when status is `warning` or `fail` |
| product_types | [object](#32-producttype)[]| Detected products' types, score and their bounding box in (x1,y1,x2,y2) format |
| result | [object](#33-product)[] | The list of products in the search results. Important fields for first release. If missing, it will be set to blank. Note that we are displaying customer’s original catalog fields in “data” field |
| objects | [object](#34-productobject)[] | When the `search_all_objects` parameter is set to `true` |
| catalog_fields_mapping | object | Original catalog’s fields mapping |
| facets | [object](#35-facet)[] | List of facet fields value and response for filtering |
| page | number | The result page number |
| limit | number | The number of results per page |
| total | number | Total number of search result |
| reqId | string | ID assigned to the request made |

### 3.1 ErrorData

| Name | Type | Description |
|:---|:---|:---|
| code | number | Error code, e.g. 401, 404 etc... |
| message | string | The server response message.  |

### 3.2 ProductType

| Name | Type | Description |
|:---|:---|:---|
| box | number[] | The image-space coordinates of the detection box that represents the product. |
| type | string | The detected type of the product. |

### 3.3 Product

| Name | Type | Description |
|:---|:---|:---|
| product_id | string | The product's ID which can be used in [Recommendations](#22-recommendations). |
| main_image_url | string | Image URL. |
| data | object | This data field is dependent on the metadata requested by user under [here](#41-example---retrieving-metadata). |

#### 3.3.1 Data

The fields returned under here are dependent on the product metadata requested through the `attrs_to_get` params and the fields indexed in your catalog.

Other than that, we return 2 default fields.

|ViSenze pre-defined catalog fields|Client X's catalog original names|
|:---|:---|
|product_id|sku|
|main_image_url|medium_image|

### 3.4 ProductObject

When using the `search_all_objects` is set to `true`, the search response will return the results in a list of ProductObject instead of a list of Product directly. The difference is that ProductObject will split the products according to type.

| Name | Type | Description |
|:---|:---|:---|
| result | [object](#33-product)[] | The list of products belonging to this type. |
| total | number | The total number of results in this type. |
| type | string | The detected type of the product. |
| box | number[] | The image-space coordinates of the detection box that represents the product. |

### 3.5 Facet

Facets are used to perform potential filtering of results.

| Name | Type | Description |
|:---|:---|:---|
| key | string |  |
| items | [object](#36-facetitem)[] |  |
| range | [object](#37-facetrange) |  |

To check usage guideline, please refer [here](https://ref-docs.visenze.com/reference/facets)

### 3.6 FacetItem

Facet for distinct value filtering.

| Name | Type | Description |
|:---|:---|:---|
| value | string |  |
| count | number |  |

### 3.7 FacetRange

Facet for value range filtering.

| Name | Type | Description |
|:---|:---|:---|
| min | string |  |
| max | string |  |

## 4. Advanced Search Parameters

There are many parameters that our API support and we will be showing you a few examples of how to use them in this section.

> You can find all of the supported advance search parameters for ProductSearch API [here](https://ref-docs.visenze.com/reference/search-by-image-api-1).

### 4.1 Example - Retrieving Metadata

To retrieve metadata of your image results, provide the list of metadata keys for the metadata value to be returned in the `attrs_to_get` property:

```js
visearch.product_search_by_image({
  im_url: 'your-image-url',
  attrs_to_get: ['price', 'brand', 'im-url'], // list of fields to be returned
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

> Note that only the indexed attributes can be retrieved with this parameter. You may go the the Edit App page in the Discovery Suite console to review which attributes have been included in the app index.

### 4.2 Example - Filtering Results

To filter search results based on metadata values, provide a string array of metadata key to filter value in the `filters` property. Only price, category, brand, original_price support filter parameter.

```js
visearch.product_search_by_image({
  im_url: 'your-image-url',
  filters: ['brand:my_brand'],
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

Params | Filter Query Behaviour | Example
--- | --- | ---
string | The filter queries are treated as exact match conditions. Applies to String, Integer and Float type fields. | `filters=brand:my_brand` means the brand (String) value of the search results must be strictly equal to “my_brand”. `filters=price:10,199` means the price (Integer) value of the search results must be strictly within the range between 10 to 199 inclusive.

For more details, check out [Filters and Text Filters](https://ref-docs.visenze.com/reference/filters-and-text-filters) section in the ViSenze Documentation Hub.

### 4.3 Example - Automatic Object Recognition

With Automatic Object Recognition, ViSearch Search by Image API is smart to detect the objects present in the query image and suggest the best matched product type to run the search on.

You can turn on the feature in upload search by setting the API parameter `detection=all`. We are now able to detect various types of fashion items, including `top`, `dress`, `bottom`, `shoe`, `bag`, `watch`. The list is ever-expanding as we explore this feature for other categories.

```js
visearch.product_search_by_image({
  im_url: 'your-image-url',
  detection: 'all',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

You could also recognize objects from a paticular type on the uploaded query image through configuring the detection parameter to a specific product type as `detection={type}`. Our API will run the search within that product type.

Sample request to detect `bag` in an uploaded image:

```js
visearch.product_search_by_image({
  im_url: 'your-image-url',
  detection: 'bag',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

The detected product types are listed in `product_types` together with the match score and box area of the detected object. Multiple objects can be detected from the query image and they are ranked from the highest score to lowest. The full list of supported product types by our API will also be returned in `product_types_list`.

## 5. Event Tracking

To improve search performance and gain useful data insights, it is recommended to send user interactions (actions) with the visual search results.

### 5.1 Setup Tracking

To send the events, we will initialize the event tracker with a tracking ID generated from your app key and placement ID for you. There are two different endpoints for tracker (1 for China and another for the rest of the world).

### 5.2 Send Events

User action(s) can be sent through an event handler. Register an event handler to the element in which the user will interact.

```javascript
visearch.send(action, {
  queryId: '<search request ID>',
  pid: '<product ID> ',
  pos: <product position in Search Results>,
  ...
  ...
}, (action, params) => {
  // success callback
}, (err) => {
  // error callback
});
```

To send events, first retrieve the search query ID (the `reqid`) found in the search results response call back.

```javascript
visearch.product_search_by_id('product-id', {
  // request parameters
}, (res) => {
  // get search query ID
  const { reqid } = res;
  // send events
});
```

#### 5.2.1 Getting session Id

```javascript
var onSuccess = (sid) => {
  /* do something */
};
var onError = (err) => {
  /* do something */
}

visearch.get_sid(onSuccess, onError);
```

#### 5.2.2 Getting user Id

```javascript
var onSuccess = (uid) => {
  /* do something */
};
var onError = (err) => {
  /* do something */
}

visearch.get_uid(onSuccess, onError);
```

#### 5.2.3 Getting query Id

```javascript
var onSuccess = (query_id) => {
  /* do something */
};
var onError = (err) => {
  /* do something */
}

visearch.get_last_query_id(onSuccess, onError);
```

This will fetch the last query Id from any request made by replacement, and if none is found retrieved from the last value saved in local storage.

Currently, we support the following event actions: `product_click`, `product_view`, `add_to_cart`, and `transaction`. The `action` parameter can be an arbitrary string and custom events can be sent.

```javascript
// send product click
visearch.send("product_click", {
                queryId: "<search reqid>",
                pid: "<your im_name>",
                pos: 1, // product position in Search Results, start from 1
            });
            
// send product impression
visearch.send("product_view", {
                queryId: "<search reqid>",
                pid: "<your im_name>",
                pos: 1, // product position in Search Results, start from 1
            });
            
// send Transaction event e.g order purchase of $300
visearch.send("transaction", {
                name: "<optional event name>" // optional event name
                queryId: "<search reqid>",
                transId: "<your transaction ID>"
                value: 300
         });

// send Add to Cart Event
visearch.send("add_to_cart", {
                queryId: "<search reqid>",
                pid: "<your im_name>",
                pos: 1, // product position in Search Results, start from 1
            });

// send custom event
visearch.send("click", {
                queryId: "<search reqid>",
                name: "click_on_camera_button",
                cat: "visual_search"
            });
```

### 5.2 Send Batch Events

User action(s) can be sent through an batch event handler.

A common use case for this batch event method is to group up all `transaction` by sending it in a batch. This SDK will automatically generate a `transId` to group transactions as an order.

```javascript
visearch.send_events('transaction', [{
  queryId: '<search request ID>',
  pid: '<product ID - 1> ',
  value: 300,
  ...
  ...
},{
  queryId: '<search request ID>',
  pid: '<product ID - 2> ',
  value: 400
  ...
  ...
}], (action, params) => {
  // success callback
}, (err) => {
  // error callback
});
```

Below are the brief description for various parameters. Please note that invalid events (such as missing required fields or exceed length limit) will not be captured by server.

Field | Description | Required
--- | --- | ---
queryId| The request id of the search. This reqid can be obtained from the search response callback:```res.reqid``` | Yes
action | Event action. Currently we support the following event actions: `product_click`, `product_view`, `add_to_cart`, and `transaction`. | Yes
pid | Product ID ( generally, this is the `im_name`) for this product. Can be retrieved via `im_name` in result. | Required for `product_view`, `product_click` and `add_to_cart` events
imUrl | Image URL ( generally this is the `im_url`) for this product. | No
pos | Position of the product in Search Results e.g. click position/ view position. Note that this starts from 1 , not 0.
transId | Transaction ID to group transactions as an order. | No
value | Transaction value e.g. numerical order value | Required for transaction event.
sid | User session ID. | No
uid | Unique user/device ID. If not provided, a random (non-personalizable) UUID will be generated to track the browser. | No
cat | A generic string to categorize / group the events in related user flow. For example: `privacy_flow`, `videos`, `search_results`. Typically, categories are used to group related UI elements. Max length: 32 | No
name | Event name e.g. `open_app` , `click_on_camera_btn`. Max length: 32. | No
label | label for main interaction object such as product title, page title. This together with `action` can be used to decide whether an event is unique e.g. if user clicks on same product twice, only 1 unique click . Max length: 32. | No
fromReqId | Generic request ID field to specify which request leads to this event e.g. click request ID that leads to the purchase. The chain can be like this queryId → clickId → purchase. Max length: 32. | No
source | Segment the traffic by tagging them e.g. from camera, from desktop. Max length: 32. | No
brand | Product brand. Max length: 64. | No
price | Product price. Numeric field, if provided must be >=0 and is a valid number. | No
currency | ISO 3 characters code e.g. “USD”. Will be validated if provided. | No
productUrl| Product URL. Max length: 512 | No
c | Advertising campaign. Max length : 64. | No
cag | Ad group name (only relevant for campaign) | No
cc | Creative name (only relevant for campaign) | No
n1 | Custom numeric parameter. | No
n2 | Custom numeric parameter. | No
n3 | Custom numeric parameter. | No
n4 | Custom numeric parameter. | No
n5 | Custom numeric parameter. | No
s1 | Custom string parameter. Max length: 64. | No
s2 | Custom string parameter. Max length: 64. | No
s3 | Custom string parameter. Max length: 64. | No
s4 | Custom string parameter. Max length: 64. | No
s5 | Custom string parameter. Max length: 64. | No
json | Custom json parameter. Max length: 512. | No

## 6. Resize settings

When performing upload search, you may notice the increased search latency with increased image file size. This is due to the increased time spent in network transferring your images to the ViSearch server, and the increased time for processing larger image files in ViSearch.

To reduce upload search latency, by default the product search by image method makes a copy of your image file and resizes the copy to 512x512 pixels if both of the original dimensions exceed 512 pixels. This is the optimized size to lower search latency while not sacrificing search accuracy for general use cases

If your image contains fine details such as textile patterns and textures, you can set a different default maximum dimension to get better search results:

```javascript
visearch.set('resize_settings', {maxHeight: 1024, maxWidth: 1024});
```

You can also call the `resize_image` method to resize the image yourself. The method takes in returns image in Data URL form.

```javascript
var resizedImage = visearch.resize_image(imgAsDataURL, resizeSettings, onSuccess, onFailure);
```
