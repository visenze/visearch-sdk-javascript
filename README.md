## visearch-javascript-sdk 

[![npm version](https://img.shields.io/npm/v/visearch-javascript-sdk.svg?style=flat)](https://www.npmjs.com/package/visearch-javascript-sdk)

JavaScript SDK for ViSearch

----
## Table of Contents
1. [Overview](#1-overview)
1. [Setup and initialization](#2-setup-and-initialization)
   1. [Run the demo](#21-run-the-demo)
1. [Searching Images](#3-searching-images)
   1. [Visually Similar Recommendations](#31-visually-similar-recommendations)
   1. [Search by Image](#32-search-by-image)
   1. [Selection Box](#321-selection-box)
   1. [Multiple Product Search](#33-multiple-product-search)
   1. [Color Search](#34-color-search)
1. [Search Results](#4-search-results)
1. [Advanced Search Parameters](#5-advanced-search-parameters)
   1. [Retrieving Metadata](#51-retrieving-metadata)
   1. [Filtering Results](#52-filtering-results)
   1. [Result Score](#53-result-score)
   1. [Automatic Object Recognition Beta](#54-automatic-object-recognition-beta)
1. [Event tracking](#6-event-tracking)
   1. [Event handler](#61-event-handler)
   1. [Tracking via url](#62-tracking-via-url)
1. [FAQ](#7-faq)
----

## 1. Overview

ViSearch is an API that provides accurate, reliable and scalable image search. ViSearch API provides endpoints that let developers index their images and perform image searches efficiently. ViSearch API can be easily integrated into your web and mobile applications. For more details, see [ViSearch API Documentation](http://developers.visenze.com/api/).

The ViSearch JavaScript SDK is an open source software for easy integration of ViSearch Search API with your application server. For source code and references, visit the [GitHub repository](https://github.com/visenze/visearch-sdk-javascript).

- Latest stable version: ![npm version](https://img.shields.io/npm/v/visearch-javascript-sdk.svg?style=flat)

## 2. Setup and initialization

For usage within a web page, paste the following snippet into the header of your site:

```html
<script type="text/javascript">
!function(e,r,t,s,a){e.__visearch_obj=a;var c=e[a]=e[a]||{};c.q=c.q||[],c.factory=function(r){return function(){var e=Array.prototype.slice.call(arguments);return e.unshift(r),c.q.push(e),c}},c.methods=["idsearch","uploadsearch","colorsearch","set","send","search","recommendation","out_of_stock","similarproducts","discoversearch"];for(var o=0;o<c.methods.length;o++){var n=c.methods[o];c[n]=c.factory(n)}var i=r.createElement(t);i.type="text/javascript",i.async=!0,i.src="//cdn.visenze.com/visearch/dist/js/visearch-1.5.2.min.js";var h=r.getElementsByTagName(t)[0];h.parentNode.insertBefore(i,h)}(window,document,"script",0,"visearch");
visearch.set('app_key', 'YOUR_APP_KEY');
</script>
```

This snippet will load `visearch.js` onto the page asynchronously, so it will not affect your page load speed.

Replace `YOUR_APP_KEY` with your ViSearch Client-side App Key. It is recommended to initiate the client when the SDK is loaded into the page.

Your credentials can be found in [ViSearch Dashboard](https://dashboard.visenze.com)

For usage with Node.js projects:

```sh
npm install visearch-javascript-sdk
```

```js
// Import module
import visearch from 'visearch-javascript-sdk';

// Set up keys
visearch.set('app_key', 'YOUR_APP_KEY');
visearch.set('timeout', TIMEOUT_INTERVAL_IN_MS); // optional; default value is 15000
visearch.set('endpoint', YOUR_ENDPOINT); // optional; default value is http://visearch.visenze.com
```

### 2.1 Run the Demo

This repository comes with an example of the SDK usage. In order to run the examples, a Node.js environment is required.

You will need to fill up your app keys in the relevant demo files.

To run the Node.js demo:

```sh
node testSDK
```

To run the web page demo:

```sh
npm run gulp
```

After the above command, the demo pages will be accessible at `http://localhost:3000/examples/*.html`, e.g.:

- `http://localhost:3000/examples/idsearch.html` for visually similar recommendations
- `http://localhost:3000/examples/colorsearch.html` for color search
- `http://localhost:3000/examples/uploadsearch.html` for search by image
- `http://localhost:3000/examples/discoversearch.html` for multiple products search

## 3. Searching Images

Any search API request should follow the pattern below.

```js
visearch.[API_METHOD](parameters, // parameter object
  function (resp) {
    // The response handler, i.e. the callback function that will be invoked after receiving a successful HTTP response
  },
  function (err) {
    // The error handler, i.e. the callback function that will be invoked after receiving a failure HTTP response
  }
);
```

Please refer to [ViSenze developers' documentation](https://developers.visenze.com/api/) to understand the format of `parameters` as well as the response format for different API methods.

Note that for `parameters`, all values must be `string` or array of `string`, i.e. you will need pass `'true'` instead of `true` for boolean parameters.

### 3.1 Visually Similar Recommendations

**Visually Similar Recommendations** solution is to search for visually similar images in the image database giving an indexed image’s unique identifier (`im_name`).

```js
visearch.search({
  im_name: 'your-image-name',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

### 3.2 Search by Image

**Search by Image** solution is to search similar images by uploading an image or providing an image URL.

* Using an image from a local file path:

Sample code for upload search with HTML form:

```html
<form>
  Upload image: <input type="file" id="fileUpload" name="fileInput"><br>
  <input type="submit" value="Submit">
</form>
```

```js
let inputImageFile = document.getElementById('fileUpload');
// Alternatively, you can use JQuery style
inputImageFile = $('#fileUpload')[0];

visearch.uploadsearch({
  image: inputImageFile,
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

> - For optimal results, we recommend images around `1024x1024` pixels. Low resolution images may result in unsatisfying search results.  
> - If the image is larger, we recommended to resize the image to `1024x1024` pixels before sending to API. Too high resolution images may result in timeout.  
> - The maximum file size of an image is 10MB. 

* Using image URL:

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

#### 3.2.1 Selection Box

If the object you wish to search for takes up only a small portion of your image, or if other irrelevant objects exists in the same image, chances are the search result could become inaccurate. Use the `box` parameter to refine the search area of the image to improve accuracy. The box coordinates needs to be set with respect to the original size of the image passed.

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  // The box format is [x1, y1, x2, y2], where
  // - (0, 0) is the top-left corner of the image
  // - (x1, y1) is the top-left corner of the box
  // - (x2, y2) is the bottom-right corner of the box
  // IMPORTANT: Do not put space before/after any comma in the box coordinates
  box: 'x1,y1,x2,y2',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

Note: if the box coordinates are invalid (negative or exceeding the image boundary), they will be ignored and the search will be equivalent to the normal Upload Search.

### 3.3 Multiple Product Search

**Multiple Product Search** solution is to search similar images by uploading an image or providing an image url, similar to Search by Image. Multiple Product Search is able to detect all objects in the image and return similar images for each at one time.

* Using an image from a local file path:

Sample code for multiple product search with HTML form:

```html
<form>
  Upload image: <input type="file" id="fileUpload" name="fileInput"><br>
  <input type="submit" value="Submit">
</form>
```

```js
var inputImageFile = document.getElementById('fileUpload');
// Alternatively, you can use JQuery style
var inputImageFile = $('#fileUpload')[0];

visearch.discoversearch({
  image: inputImageFile,
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

* Using image URL:

```js
visearch.discoversearch({
  im_url: 'your-image-url',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

### 3.4 Color Search

**Search by Color** solution is to search images with similar color by providing a color code. The color code should be in hexadecimal and passed to the colorsearch service.

```js
visearch.colorsearch({
  color: 'fa4d4d',
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

## 4. Search Results

ViSearch returns a maximum number of 1000 most relevant image search results. You can provide pagination parameters to control the paging of the image search results.

Pagination parameters:

| Name | Type | Description |
| ---- | ---- | ----------- |
| page | Integer | Optional parameter to specify the page of results. The first page of result is 1. Defaults to 1. |
| limit | Integer | Optional parameter to specify the result per page limit. Defaults to 10. |

```js
visearch.uploadsearch({
  im_url: 'your-image-url',
  page: 1,
  limit: 25,
}, (res) => {
  // TODO handle response
}, (err) => {
  // TODO handle error
});
```

## 5. Advanced Search Parameters

### 5.1 Retrieving Metadata

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

### 5.2 Filtering Results

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

### 5.3 Result Score

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

### 5.4 Automatic Object Recognition Beta

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

ViSearch Javascript SDK provides methods to understand how your customer interact with the search results.

In addition, to improve subsequent search quality, it is recommended to send user actions when they interact with the results.

### 6.1 Event handler

User action can be sent through an event handler. Register an event handler to the element in which the user will interact.

```js
visearch.send({
  reqid: 'xxxxxx',
  im_name: 'xxxxxx',
  action: 'action type',
});
```

* `reqid`

The request id of the search request. This `reqid` can be obtained from the all search responses.

```js
visearch.search({
  // request parameters
}, (res) => {
  const { reqid } = res;
  // process reqid
});
```

* `action`

The action type of this event. Currently we support three types, `click`, `add_to_cart`, and `add_to_wishlist`.

```js
visearch.send({
  reqid: 'xxxxxx',
  im_name: 'xxxxxx',
  action: 'click',
});
```

* `im_name`

The `im_name` of the image which the user has clicked on. `im_name` is the unique identifier of the indexed image, in this case the searched result.

### 6.2 Tracking via URL

The SDK provides another alternative to event tracking which is via URL. Append the following URL requests into the links where the user will interact.

```html
?reqid={reqid}&im_name={im_name}
```

When the link is clicked, the system will detect the user interaction.

```html
<a href="domain/path?reqid={reqid}&im_name={im_name}">text</a>
```

## 7. FAQ

* When performing upload search, you may notice the increased search latency with increased image file size. This is due to the increased time spent in network transferring your images to the ViSearch server, and the increased time for processing larger image files in ViSearch.
