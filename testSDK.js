const assert = require('assert');
const ViSearch = require('./js/index');

// insert your app key to test visearch API here;
const visearchConfigs = {
  app_key: 'YOUR_APP_KEY_1',
  tracker_code: 'YOUR_TRACKER_CODE',
  is_cn: false, // flag to send request to CN endpoint
  timeOut: 2000,
  endpoint: '',
};

// insert your app key to test productsearch API here;
const searchConfigs = {
  app_key: 'YOUR_APP_KEY_S',
  placement_id: 'P1',
  is_cn: false, // flag to send request to CN endpoint
  timeOut: 2000,
  endpoint: '',
};

// insert your app key to test productsearch API here;
const recConfigs = {
  app_key: 'YOUR_APP_KEY_R',
  placement_id: 'P2',
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
const IM_URL = 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/199893/item/goods_09_199893.jpg';
const QUERY_ID = 'fake-query-id';
const PID = 'pid';
const EVENT = 'event';

const visearch1 = new ViSearch(visearchConfigs).visearch;
const visearchSearch = new ViSearch(searchConfigs).visearch;
const visearchRec = new ViSearch(recConfigs).visearch;
const visearchEmpty = new ViSearch(emptyConfigs).visearch;

const log = (message, response) => {
  console.log('\n-----------');
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
      log('FAIL: Visearch API search should give result', res);
    }
  }, (err) => {
    log('FAIL: Visearch API search should give result', err);
  });

  visearchSearch.product_search_by_image({
    im_url: IM_URL,
    attrs_to_get: ['product_id'],
  }, (res) => {
    try {
      assert.strictEqual(res.status, 'OK');
    } catch (err) {
      log('FAIL: ProductSearch API product_search_by_image should give result', res);
    }
  }, (err) => {
    log('FAIL: ProductSearch API product_search_by_image should give result', err);
  });

  visearchRec.product_search_by_id(PID, {
    attrs_to_get: ['product_id', 'main_image_url'],
  }, (res) => {
    try {
      assert.strictEqual(res.status, 'OK');
    } catch (err) {
      log('FAIL: ProductSearch API product_search_by_id should give result', res);
    }
  }, (err) => {
    log('FAIL: ProductSearch API product_search_by_id should give result', err);
  });

  visearchSearch.send(EVENT, {
    queryId: QUERY_ID,
    pid: IM_NAME,
  }, (res) => {
    try {
      assert.strictEqual(res, EVENT);
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
    visearchSearch.get_default_tracking_params((data) => {
      resolve(data);
    });
  });
  const meta2 = await new Promise((resolve, reject) => {
    visearchRec.get_default_tracking_params((data) => {
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
