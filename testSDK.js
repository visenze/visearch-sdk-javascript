const assert = require('assert');
const ViSearch = require('./js/index');

// insert your app key to test visearch API here;
const visearchConfigs = {
  app_key: 'YOUR_APP_KEY_1',
  tracker_code: 'YOUR_TRACKER_CODE',
  is_cn: false, // flag to send request to CN endpoint
  timeOut: 20,
  endpoint: '',
};

// insert your app key to test productsearch API here;
const productSearchConfigs = {
  app_key: 'YOUR_APP_KEY_2',
  placement_id: 'YOUR_PLACEMENT_ID',
  is_cn: false, // flag to send request to CN endpoint
  timeOut: 2000,
  endpoint: '',
};

const emptyConfigs = {
  app_key: 'INVALID',
  placement_id: 'INVALID',
};

// TODO: insert the image name and url here
const IM_NAME = 'im_name';
const IM_URL = 'im_url';
const QUERY_ID = 'fake-query-id';

const visearch1 = new ViSearch(visearchConfigs).visearch;
const visearch2 = new ViSearch(productSearchConfigs).visearch;
const visearchEmpty = new ViSearch(emptyConfigs).visearch;

const log = (message, response) => {
  console.log('-----------');
  console.log(message);
  console.log(response);
  console.log('\n');
};

function testAPISuccess() {
  visearch1.search({
    im_name: IM_NAME,
    fl: ['im_url'],
  }, (res) => {
    try {
      assert.strictEqual(res.status, 'OK');
    } catch (err) {
      log('FAIL: Visearch API call should give result', res);
    }
  }, (err) => {
    log('FAIL: Visearch API call should give result', err);
  });

  visearch2.search({
    im_name: IM_NAME,
    fl: ['im_url'],
  }, (res) => {
    try {
      assert.strictEqual(res.status, 'OK');
    } catch (err) {
      log('FAIL: ProductSearch API call should give result', res);
    }
  }, (err) => {
    log('FAIL: ProductSearch API call should give result', err);
  });

  visearch1.send('click', {
    queryId: QUERY_ID,
    pid: IM_NAME,
  }, (res) => {
    try {
      assert.strictEqual(res.status, 'OK');
    } catch (err) {
      log('FAIL: Tracking event should send successfully', err);
    }
  }, (err) => {
    log('FAIL: Tracking event should send successfully', err);
  });
}

function testAPIFailure() {
  visearchEmpty.product_search_by_image({
    im_url: IM_URL,
    attrs_to_get: ['product_id'],
  }, (res) => {
    try {
      assert.strictEqual(res.status, 'fail');
    } catch (err) {
      log('FAIL: No credentials call should fail', res);
    }
  }, (err) => {
    log('FAIL: No credentials call should fail', err);
  });
}

async function testMultipleVisearchInstances() {
  const meta1 = await new Promise((resolve, reject) => {
    visearch1.get_default_tracking_params((data) => {
      resolve(data);
    });
  });
  const meta2 = await new Promise((resolve, reject) => {
    visearch2.get_default_tracking_params((data) => {
      resolve(data);
    });
  });
  try {
    assert.notStrictEqual(meta1.code, meta2.code);
  } catch (err) {
    log('FAIL: Different visearch instances should have different tracking codes', [meta1.code, meta2.code]);
  }
}

testAPISuccess();
testAPIFailure();
testMultipleVisearchInstances();
