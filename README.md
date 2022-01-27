# visearch-javascript-sdk

[![npm version](https://img.shields.io/npm/v/visearch-javascript-sdk.svg?style=flat)](https://www.npmjs.com/package/visearch-javascript-sdk)

ViSenze's Javascript SDK provides accurate, reliable and scalable image search APIs within our catalogs. It initially started with just the [ViSearch API](#2-visearch-api) but soon expanded to include the [ProductSearch API](#3-productsearch-api) after the release of the Catalog system (2021). Both APIs included in this SDK aims to provide developers with endpoints that executes image search efficiently while also making it easy to integrate into webapps.

> Note: In order to use any of our SDKs, you are required to have a ViSenze developer account. You will gain access to your own dashboard to manage your appkeys and catalogs. Visit [here](https://developers.visenze.com) for more info.

----

## Table of Contents

- [visearch-javascript-sdk](#visearch-javascript-sdk)
  - [Table of Contents](#table-of-contents)
  - [1. Quickstart](#1-quickstart)
    - [1.1 Installation](#11-installation)
    - [1.2 Setup](#12-setup)
    - [1.3 Demo](#13-demo)
  - [2. ViSearch API](#2-visearch-api)
    - [2.1 Visually Similar Recommendations](#21-visually-similar-recommendations)
    - [2.2 Search by Image](#22-search-by-image)
      - [2.2.1 Selection Box](#221-selection-box)
    - [2.3 Multiple Product Search](#23-multiple-product-search)
    - [2.4 Search by Color](#24-search-by-color)
  - [3. ProductSearch API](#3-productsearch-api)
    - [3.1 Search by Image](#31-search-by-image)
    - [3.2 Recommendations](#32-recommendations)
  - [4. Search Results](#4-search-results)
    - [4.1 ErrorData](#41-errordata)
    - [4.2 ProductType](#42-producttype)
    - [4.3 Product](#43-product)
      - [4.3.1 Data](#431-data)
    - [4.4 ProductObject](#44-productobject)
    - [4.5 Facet](#45-facet)
    - [4.6 FacetItem](#46-facetitem)
    - [4.7 FacetRange](#47-facetrange)
  - [5. Advanced Search Parameters](#5-advanced-search-parameters)
    - [5.1 Example - Retrieving Metadata](#51-example---retrieving-metadata)
    - [5.2 Example - Filtering Results](#52-example---filtering-results)
    - [5.3 Example - Result Score](#53-example---result-score)
    - [5.4 Example - Automatic Object Recognition Beta](#54-example---automatic-object-recognition-beta)
  - [6. Event Tracking](#6-event-tracking)
    - [6.1 Setup Tracking](#61-setup-tracking)
    - [6.2 Send Events](#62-send-events)

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

Before you can start using the SDK, you will need to set up the SDK keys. Most of these keys can be found in your account's [dashboard](https://developers.visenze.com).

Firstly, take a look at the table below to understand what each key represents:

| Key | Importance | Description |
|:---|:---|:---|
| app_key | Compulsory | All SDK functions depends on a valid app_key being set. The app key also limits the API features you can use. |
| tracker_code | Situational | Required if you are using [ViSearch API](#2-visearch-api). |
| placement_id | Situational | Required if you are using [ProductSearch API](#3-productsearch-api). |
| endpoint | Situational | Depending on which API you use, they both depend on different endpoints. </br> [ViSearch API](#2-visearch-api): `https://visearch.visenze.com/` </br> [ProductSearch API](#3-productsearch-api): `https://search.visenze.com/` |
| timeout | Optional | Defaulted to 15000 |

Next, depending on how you are using the SDK, set up the relevant SDK keys:

- If you are using the project provided directly from the main [repo](https://github.com/visenze/visearch-sdk-javascript):
  - Locate all `*.html` files within the `./examples` directory
  - Look for all `// TODO: ` comments and fill them up:
  ![todo_example](/readme_images/todo_example.png)
  - Any additional keys to be set should also be placed in the same area:
  ![more_keys_example](/readme_images/more_keys_example.png)

- If you included this SDK into your own project via npm, add the following at the start of your app:
  
  ```javascript
  // Import module
  import ViSearch from 'visearch-javascript-sdk';

  // Initialize visearch instance
  const { visearch } = new ViSearch();

  // Set up keys
  visearch.set('app_key', 'YOUR_APP_KEY');
  visearch.set('tracker_code', 'YOUR_TRACKER_CODE');
  visearch.set('placement_id', 'YOUR_PLACEMENT_ID'); 
  visearch.set('endpoint', YOUR_ENDPOINT);
  visearch.set('timeout', TIMEOUT_INTERVAL_IN_MS);
  ```

  - If you want to create multiple instances of ViSearch, you can instantiate ViSearch multiple times.

  ```javascript
  // Import module
  import ViSearch from 'visearch-javascript-sdk';

  // Initialize visearch instance
  const visearch = new ViSearch().visearch;
  const visearch2 = new ViSearch().visearch;

  // Set up keys
  visearch.set('app_key', 'YOUR_APP_KEY');
  visearch2.set('app_key', 'YOUR_APP_KEY');
  ```

- If you wish to include the SDK directly onto your webpage, add this to the header of your site:

  ```html
  <script type="text/javascript">
  (function(e,r,t,a,o){var i=e.visearch=e.visearch||{};i.q=i.q||[],i.factory=function(e){return function(){var r=Array.prototype.slice.call(arguments);return r.unshift(e),i.q.push(r),i}},i.methods=["idsearch","uploadsearch","colorsearch","set","send","search","recommendation","out_of_stock","similarproducts","discoversearch","product_search_by_image","product_search_by_id","product_recommendations","set_uid","get_uid","get_sid","get_session_time_remaining","reset_session"];for(var s=0;s<i.methods.length;s++){var n=i.methods[s];i[n]=i.factory(n)}var c=r.createElement(t);c.type="text/javascript",c.async=!0,c.src=a;var d=r.getElementsByTagName(t)[0];d.parentNode.insertBefore(c,d),c.onload=function(){for(var r=0;r<initFactoryArray.length;r++){var t=initFactoryArray[r];if(!t.obj_name){t.obj_name=o,t.init(e.visearch);break}}},c.onerror=function(){console.log("Unable to initialize ViSearch SDK")}}(window,document,"script","https://cdn.visenze.com/visearch/dist/js/visearch-2.2.2.min.js","visearch"));

  visearch.set('app_key', 'YOUR_APP_KEY');
  visearch.set('tracker_code', 'YOUR_TRACKER_CODE');
  visearch.set('placement_id', 'YOUR_PLACEMENT_ID');
  </script>
  ```

  - If you want to include multiple instances of ViSearch onto the webpage but with different configurations and placements, copy the same code but change the keyword "visearch" into your desired instance name.

  ```html
  <script type="text/javascript">
  ...(window,document,"script",0,"visearch");

  visearch.set('app_key', 'YOUR_APP_KEY_1');
  visearch.set('placement_id', 'YOUR_PLACEMENT_ID_1');
  </script>

  <script type="text/javascript">
  ...(window,document,"script",0,"visearch2");

  visearch2.set('app_key', 'YOUR_APP_KEY_2');
  visearch2.set('placement_id', 'YOUR_PLACEMENT_ID_2');
  </script>
  ```

### 1.3 Demo

The demo is only applicable to those who work directly off the main [repo](https://github.com/visenze/visearch-sdk-javascript). You are required to have a Node.js environment and remember to **fill up the relevant demo files**.

- To run the Node.js demo:
  
  ```javascript
  node testSDK
  ```

  > Update the `// TODO` in [here](/testSDK.js).

- To run the webpage demo:
  
  ```javascript
  npm run gulp
  ```

  After the above command, you should see that the server is running locally on your device. You can then access the different demo webpages in your browser by using this format `http://localhost:3000/examples/*.html`.

  - E.g. Visually similar recommendations:

    `http://localhost:3000/examples/idsearch.html`

  - E.g. Color search:

    `http://localhost:3000/examples/colorsearch.html`

  - E.g. Search by Image:

    `http://localhost:3000/examples/uploadsearch.html`

  - E.g. Multiple Products Search:

    `http://localhost:3000/examples/discoversearch.html`
  
  > Update the `// TODO` in all `*.html` files within the `./examples` directory

## 2. ViSearch API

Any ViSearch API request should follow this signature:
`visearch.[API_METHOD](params, options, callback, failure)`.

For better understanding of the format and explanation on what the parameters mean, please refer to our [ViSearch developer docs](
https://developers.visenze.com/api/#search-api).

### 2.1 Visually Similar Recommendations

GET /search

Search for visually similar images in the image database given an indexed image’s unique identifier.

```javascript
const parameters = {
  im_name: 'your-image-name'
};

const onResponse = (response)=> {
  // TODO handle response
}

const onError = (error)=> {
  // TODO handle error
}

visearch.search(parameters, onResponse, onError);
```

> The request parameters for this API can be found [here](https://developers.visenze.com/api/#visually-similar-recommendations).

### 2.2 Search by Image

POST /uploadsearch

Search for similar images by uploading an image or providing an image URL.

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

  visearch.uploadsearch(parameters, onResponse, onError);
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

  visearch.uploadsearch(parameters, onResponse, onError);
  ```

#### 2.2.1 Selection Box

If the object you wish to search for takes up only a small portion of your image, or if other irrelevant objects exists in the same image, chances are the search result could become inaccurate. Modify your parameters to include the box parameter to refine the search area of the image to improve accuracy. The box coordinates needs to be set with respect to the original size of the image passed:

```javascript
const parameters = {
  im_url: 'your-image-url',
  // The box format is [x1, y1, x2, y2], where
  // - (0, 0) is the top-left corner of the image
  // - (x1, y1) is the top-left corner of the box
  // - (x2, y2) is the bottom-right corner of the box
  // IMPORTANT: Do not put space before/after any comma in the box coordinates
  box: 'x1,y1,x2,y2'
};
```

> The request parameters for this API can be found [here](https://developers.visenze.com/api/#search-by-image).
>
> - For optimal results, we recommend images around 1024x1024 pixels. Low resolution images may result in unsatisfying search results.
>
> - If the image is larger, we recommended to resize the image to 1024x1024 pixels before sending to API. Too high resolution images may result in timeout.
>
> - The maximum file size of an image is 10MB.

### 2.3 Multiple Product Search

POST /discoversearch

Similar to [Search by Image](#22-search-by-image), Multiple Product Search allows you to be able to detect all objects in the image and return similar images for each at one time instead.

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

  visearch.discoversearch(parameters, onResponse, onError);
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

  visearch.discoversearch(parameters, onResponse, onError);
  ```

> The request parameters for this API can be found [here](https://developers.visenze.com/api/#multiple-product-search).

### 2.4 Search by Color

GET /colorsearch

Search images with similar color by providing a color code. The color code should be in hexadecimal and passed to the colorsearch service.

```javascript
const parameters = {
  color: 'fa4d4d'
};

const onResponse = (response)=> {
  // TODO handle response
}

const onError = (error)=> {
  // TODO handle error
}

visearch.colorsearch(parameters, onResponse, onError);
```

> The request parameters for this API can be found [here](https://developers.visenze.com/api/#search-by-color).

## 3. ProductSearch API

This API differs from those of [ViSearch API](#2-visearch-api) in that the aggregation of search results is done on a product level instead of image level.

### 3.1 Search by Image

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

> The request parameters for this API can be found [// TODO: link to public documentation]().
>
> You will notice that this is the same as some of [ViSearch API](#2-visearch-api) methods. However, on the backend, the logic for search is done differently as mentioned in [ProductSearch API](#3-productsearch-api).

### 3.2 Recommendations

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

> The request parameters for this API can be found [// TODO: link to public documentation]().

## 4. Search Results

Javascript does not contain type definitions and the REST API response for all our APIs will instead just convert straight into javascript objects. Here are some of the [ProductSearch API](#3-productsearch-api)'s response object's keys to take note of:

> For [ViSearch API](#2-visearch-api)'s response, you can find them in the [ViSearch developer doc](https://developers.visenze.com/api/#search-api).

| Name | Type | Description |
|:---|:---|:---|
| status | string | The request status, either `OK`, `warning`, or `fail` |
| imId | string | Image ID. Can be used to search again without reuploading |
| im_id | string |  |
| error | [object](#41-errordata) | Error message and code if the request was not successful i.e. when status is `warning` or `fail` |
| product_types | [object](#42-producttype)[]| Detected products' types, score and their bounding box in (x1,y1,x2,y2) format |
| result | [object](#43-product)[] | The list of products in the search results. Important fields for first release. If missing, it will be set to blank. Note that we are displaying customer’s original catalog fields in “data” field |
| objects | [object](#44-productobject)[] | When the `searchAllObjects` parameter is set to `true` |
| catalog_fields_mapping | object | Original catalog’s fields mapping |
| facets | [object](#45-facet)[] | List of facet fields value and response for filtering |
| page | number | The result page number |
| limit | number | The number of results per page |
| total | number | Total number of search result |
| reqId | string | ID assigned to the request made |

### 4.1 ErrorData

| Name | Type | Description |
|:---|:---|:---|
| code | number | Error code, e.g. 401, 404 etc... |
| message | string | The server response message.  |

### 4.2 ProductType

| Name | Type | Description |
|:---|:---|:---|
| box | number[] | The image-space coordinates of the detection box that represents the product. |
| type | string | The detected type of the product. |
| score | number | The detection's score of the product. |

### 4.3 Product

| Name | Type | Description |
|:---|:---|:---|
| product_id | string | The product's ID which can be used in [Recommendations](#32-recommendations). |
| main_image_url | string | Image URL. |
| data | object | This data field is slightly more complicated and deserves its own section over [here](#541-data). |
| score | number | The detection score of the product. |

#### 4.3.1 Data

To better explain what the `data` field is, take a look at the table below (database field_names):

|ViSenze pre-defined catalog fields|Client X's catalog original names|
|:---|:---|
|product_id|sku|
|main_image_url|medium_image|
|title|product_name|
|product_url|link|
|price|sale_price|
|brand|brand|

The table is a representation of how ViSenze's Catalog name its fields vs how Client X's database name its fields - both fields essentially mean the same thing just named differently.

> i.e. visenze_database["product_id"] == client_x_database["sku"]

You can find the schema mapping of ViSenze and the Client's in the `catalogFieldsMapping` variable found in [ProductResponse](#51-productresponse) - if the [ProductSearchByImageParams](#42-productsearchbyimageparams) have its `returnFieldsMapping` variable set to `true` when the search was called.

### 4.4 ProductObject

When using the `searchAllObjects` is set to `true`, the search response will return the results in a list of ProductObject instead of a list of Product directly. The difference is that ProductObject will split the products according to type.

| Name | Type | Description |
|:---|:---|:---|
| result | [object](#43-product)[] | The list of products belonging to this type. |
| total | number | The total number of results in this type. |
| type | string | The detected type of the product. |
| score | number | The detection's score of the product. |
| box | number[] | The image-space coordinates of the detection box that represents the product. |

### 4.5 Facet

Facets are used to perform potential filtering of results.

| Name | Type | Description |
|:---|:---|:---|
| key | string |  |
| items | [object](#46-facetitem)[] |  |
| range | [object](#47-facetrange) |  |

### 4.6 FacetItem

Facet for distinct value filtering.

| Name | Type | Description |
|:---|:---|:---|
| value | string |  |
| count | number |  |

### 4.7 FacetRange

Facet for value range filtering.

| Name | Type | Description |
|:---|:---|:---|
| min | string |  |
| max | string |  |

## 5. Advanced Search Parameters

There are many parameters that our API support and we will be showing you a few examples of how to use them in this section.

> You can find all of the supported advance search parameters for ViSearch API [here](https://developers.visenze.com/api/#advanced-parameters) and for ProductSearch API [// TODO: link to public documentation]().

### 5.1 Example - Retrieving Metadata

To retrieve metadata of your image results, provide the list of metadata keys for the metadata value to be returned in the `fl` (field list) property:

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  fl: ['price', 'brand', 'im-url'], // list of fields to be returned
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

To retrieve all metadata of your image results, specify `get_all_fl` parameter and set it to `true`:

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  get_all_fl: 'true',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

> Only metadata of type `string`, `int`, and `float` can be retrieved from ViSearch. Metadata of type `text` is not available for retrieval.

### 5.2 Example - Filtering Results

To filter search results based on metadata values, provide a string array of metadata key to filter value in the `fq` (filter query) property:

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  fq: ['description: bag', 'brand: nike'],
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

Querying syntax for each metadata type is listed in the following table:

Type | FQ
--- | ---
string | Metadata value must be exactly matched with the query value, e.g. "Vintage Wingtips" would not match "vintage wingtips" or "vintage"
text | Metadata value will be indexed using full-text-search engine and supports fuzzy text matching, e.g. "A pair of high quality leather wingtips" would match any word in the phrase
int | Metadata value can be either: <ul><li>exactly matched with the query value</li><li>matched with a ranged query `minValue,maxValue`, e.g. int value `99` would match ranged query `0,199` but would not match ranged query `200,300`</li></ul>
float | Metadata value can be either: <ul><li>exactly matched with the query value</li><li>matched with a ranged query `minValue,maxValue`, e.g. float value `99.99` would match ranged query `0.0,199.99` but would not match ranged query `200.0,300.0`</li></ul>

### 5.3 Example - Result Score

ViSearch image search results are ranked in descending order i.e. from the highest scores to the lowest, ranging from `1.0` to `0.0`. By default, the score for each image result is not returned. You can turn on the `score` property to retrieve the scores for each image result:

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  score: 'true',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

If you need to restrict search results from a minimum score to a maximum score, specify the `score_min` and/or `score_max` parameters:

Name | Type | Description
---- | ---- | -----------
`score_min` | `float` | Minimum score for the image results. Default is `0.0`.
`score_max` | `float` | Maximum score for the image results. Default is `1.0`.

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  score: 'true',
  score_min: '0.2',
  score_max: '0.5',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

### 5.4 Example - Automatic Object Recognition Beta

With Automatic Object Recognition, ViSearch Search by Image API is smart to detect the objects present in the query image and suggest the best matched product type to run the search on.

You can turn on the feature in upload search by setting the API parameter `detection=all`. We are now able to detect various types of fashion items, including `Top`, `Dress`, `Bottom`, `Shoe`, `Bag`, `Watch` and `Indian Ethnic Wear`. The list is ever-expanding as we explore this feature for other categories.

Notice: This feature is currently available for fashion application type only. You will need to make sure your app type is configurated as "fashion" on [ViSenze dashboard](https://developers.visenze.com/setup/#Choose-your-image-types).

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  score: 'true',
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
visearch.uploadsearch({
  im_url: 'your-image-url',
  score: 'true',
  detection: 'bag',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

The detected product types are listed in `product_types` together with the match score and box area of the detected object. Multiple objects can be detected from the query image and they are ranked from the highest score to lowest. The full list of supported product types by our API will also be returned in `product_types_list`.

## 6. Event Tracking

To improve search performance and gain useful data insights, it is recommended to send user interactions (actions) with the visual search results.

### 6.1 Setup Tracking

To send the events, you will first need to initialize the event tracker with a tracking ID (found under ViSenze dashboard's Tracking Integration page). There are two different endpoints for tracker (1 for China and another for the rest of the world). If the SDK is intended to be used in China region, please set `is_cn` parameter to `true`.

```javascript
// set tracking ID 
visearch.set("tracker_code", 'YOUR_TRACKING_ID');

// optional, send events to global or China server
visearch.set("is_cn", false);
```

### 6.2 Send Events

User action(s) can be sent through an event handler. Register an event handler to the element in which the user will interact.

```javascript
visearch.send(action, {
  queryId: '<search request ID>',
  pid: '<product ID> ',
  pos: <product position in Search Results>,
  imUrl: 'product image URL'
  ...
  ...
});
```

To send events, first retrieve the search query ID (the `reqid`) found in the search results response call back. 

```javascript
visearch.search({
  // request parameters
}, (res) => {
  // get search query ID
  const { reqid } = res;
  // send events
});
```

Currently, we support the following event actions: `click`, `view`, `product_click`, `product_view`, `add_to_cart`, and `transaction`. The `action` parameter can be an arbitrary string and custom events can be sent.

```javascript
// send product click
visearch.send("product_click", {
                queryId: "<search reqid>",
                pid: "<your im_name>",
                pos: 1, // product position in Search Results, start from 1
                imUrl: "<product image URL e.g. im_url>"
            });
            
// send product impression
visearch.send("product_view", {
                queryId: "<search reqid>",
                pid: "<your im_name>",
                pos: 1, // product position in Search Results, start from 1
                imUrl: "<product image URL e.g. im_url>"
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
                imUrl: "<product image URL e.g. im_url>"
            });

// send custom event
visearch.send("click", {
                queryId: "<search reqid>",
                name: "click_on_camera_button",
                cat: "visual_search"
            });
```

Below are the brief description for various parameters. Please note that invalid events (such as missing required fields or exceed length limit) will not be captured by server.

Field | Description | Required
--- | --- | ---
queryId| The request id of the search. This reqid can be obtained from the search response callback:```res.reqid``` | Yes
action | Event action. Currently we support the following event actions: `click`, `view`, `product_click`, `product_view`, `add_to_cart`, and `transaction`. | Yes
pid | Product ID ( generally, this is the `im_name`) for this product. Can be retrieved via `im_name` in result. | Required for `product_view`, `product_click` and `add_to_cart` events
imUrl | Image URL ( generally this is the `im_url`) for this product. | Required for `product_view`, `product_click` and `add_to_cart` events
pos | Position of the product in Search Results e.g. click position/ view position. Note that this starts from 1 , not 0. | Required for `product_view`, `product_click` and `add_to_cart` events
transId | Transaction ID | Required for transaction event.
value | Transaction value e.g. numerical order value | Required for transaction event.
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
