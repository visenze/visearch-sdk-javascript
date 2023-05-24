import { ViSearch } from '../src/visearch';
import { expect, jest, test } from '@jest/globals';
import * as dotenv from 'dotenv';
dotenv.config()

const searchConfigs = {
  app_key: process.env.SEARCH_APP_KEY,
  placement_id: process.env.SEARCH_PLACEMENT_ID,
  timeOut: 2000,
};

const recConfigs = {
  app_key: process.env.REC_APP_KEY,
  placement_id: process.env.REC_PLACEMENT_ID,
  timeOut: 2000,
};

const IM_URL = process.env.SEARCH_IM_URL;
const PID = process.env.REC_PID;

const searchClient = ViSearch(searchConfigs);
const recClient = ViSearch(recConfigs);

const getQueryIdAsync = async (client) => {
  return new Promise(resolve => {
    client.get_last_query_id((reqid) => resolve(reqid));
  })
};

const getDefaultParamAsyncs = async (client) => {
  return new Promise((resolve) => {
    client.get_default_tracking_params((data) => {
      resolve(data);
    });
  });
}

const assertSearchSuccess = async (client, response) => {
  const lastReqId = await getQueryIdAsync(client);
  expect(response.status).toBe('OK');
  expect(lastReqId).toEqual(response.reqid);
};

beforeEach(() => {
  localStorage.clear();
});

describe('init ViSearch', () => {
  test('from init config', async () => {
    const client = ViSearch({
      app_key: 'A',
      placement_id: 'P11',
    });
    const meta = await getDefaultParamAsyncs(client);
    expect(meta.code).toBe('A:P11');
  });

  test('from using set', async () => {
    const client = ViSearch();
    client.set('app_key', 'B');
    client.set('placement_id', 'P12');
    const meta = await getDefaultParamAsyncs(client);

    expect(meta.code).toBe('B:P12');
  });

  test('from using set_keys', async () => {
    const client = ViSearch();
    client.set_keys({
      app_key: 'C',
      placement_id: 'P13',
    });
    const meta = await getDefaultParamAsyncs(client);
    expect(meta.code).toBe('C:P13');
  });

  test('multiple instances init correctly', async () => {
    const meta1 = await getDefaultParamAsyncs(searchClient);
    const meta2 = await getDefaultParamAsyncs(recClient);
    expect(meta1.code).not.toBe(meta2.code);

    const meta1_next = await getDefaultParamAsyncs(searchClient)
    expect(meta1.code).toEqual(meta1_next.code);
  });
})

describe('search', () => {
  test('search by image url', async () => {
    const res = await new Promise((resolve) => {
      searchClient.product_search_by_image({
        im_url: IM_URL,
        attrs_to_get: ['product_id'],
      }, (res) => {
        resolve(res);
      });
    });
    await assertSearchSuccess(searchClient, res);
  });
});

describe('recommendations', () => {
  test('search success', async () => {
    const res = await new Promise((resolve) => {
      recClient.product_search_by_id(PID, {
        attrs_to_get: ['product_id', 'main_image_url'],
      }, (res) => {
        resolve(res);
      });
    });
    await assertSearchSuccess(recClient, res);
  });
});
