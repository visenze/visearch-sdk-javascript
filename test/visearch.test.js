import { ViSearch } from '../src/visearch';
import { expect, jest, test } from '@jest/globals';
import * as dotenv from 'dotenv';
dotenv.config();

const searchConfigs = {
  app_key: process.env.SEARCH_APP_KEY,
  placement_id: process.env.SEARCH_PLACEMENT_ID,
  endpoint: process.env.ENDPOINT,
  timeOut: 2000,
};

const recConfigs = {
  app_key: process.env.REC_APP_KEY,
  placement_id: process.env.REC_PLACEMENT_ID,
  endpoint: process.env.ENDPOINT,
  timeOut: 2000,
};

const IM_URL = process.env.SEARCH_IM_URL;
const PID = process.env.REC_PID;

const searchClient = ViSearch(searchConfigs);
const recClient = ViSearch(recConfigs);

const getQueryIdAsync = async (client) => {
  return new Promise((resolve) => {
    client.getLastQueryId((reqid) => resolve(reqid));
  });
};

const getDefaultParamAsyncs = async (client) => {
  return new Promise((resolve) => {
    client.getDefaultTrackingParams((data) => {
      resolve(data);
    });
  });
};

const assertSearchSuccess = async (client, response) => {
  const lastReqId = await getQueryIdAsync(client);
  expect(response.status).toBe('OK');
  expect(lastReqId).toEqual(response.reqid);
};

beforeEach(() => {
  localStorage.clear();
});

describe('cloud domain routing', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'test-reqid' },
        json: () => Promise.resolve({ status: 'OK', reqid: 'test-reqid', result: [{ product_id: 'p1' }] }),
      }),
    );
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function getCalledUrl() {
    return fetchMock.mock.calls[0][0].toString();
  }

  test('cloud:aws uses multisearch-aw domain and v1/search path', async () => {
    const client = ViSearch({ app_key: 'k', placement_id: 'p', cloud: 'aws' });
    await new Promise((resolve) => client.productMultisearch({ q: 'test' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('multisearch-aw.rezolve.com');
    expect(url).toContain('v1/search');
    expect(url).not.toContain('v1/product');
  });

  test('cloud:azure uses multisearch-az domain and v1/search path', async () => {
    const client = ViSearch({ app_key: 'k', placement_id: 'p', cloud: 'azure' });
    await new Promise((resolve) => client.productMultisearch({ q: 'test' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('multisearch-az.rezolve.com');
    expect(url).toContain('v1/search');
    expect(url).not.toContain('v1/product');
  });

  test('no cloud key uses legacy domain and v1/product/multisearch path', async () => {
    const client = ViSearch({ app_key: 'k', placement_id: 'p' });
    await new Promise((resolve) => client.productMultisearch({ q: 'test' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('multimodal.search.rezolve.com');
    expect(url).toContain('v1/product/multisearch');
  });

  test('endpoint set to aws cloud domain (no cloud key) uses new paths', async () => {
    const client = ViSearch({ app_key: 'k', placement_id: 'p', endpoint: 'https://multisearch-aw.rezolve.com' });
    await new Promise((resolve) => client.productMultisearch({ q: 'test' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('multisearch-aw.rezolve.com');
    expect(url).toContain('v1/search');
    expect(url).not.toContain('v1/product');
  });

  test('endpoint set to azure cloud domain (no cloud key) uses new paths', async () => {
    const client = ViSearch({ app_key: 'k', placement_id: 'p', endpoint: 'https://multisearch-az.rezolve.com' });
    await new Promise((resolve) => client.productMultisearch({ q: 'test' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('multisearch-az.rezolve.com');
    expect(url).toContain('v1/search');
    expect(url).not.toContain('v1/product');
  });

  test('custom staging endpoint uses legacy paths even when cloud is set', async () => {
    const client = ViSearch({
      app_key: 'k',
      placement_id: 'p',
      endpoint: 'https://staging.example.com',
      cloud: 'aws',
    });
    await new Promise((resolve) => client.productMultisearch({ q: 'test' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('staging.example.com');
    expect(url).toContain('v1/product/multisearch');
  });

  test('cloud:aws uses v1/visearch path for searchByImage', async () => {
    const client = ViSearch({ app_key: 'k', placement_id: 'p', cloud: 'aws' });
    await new Promise((resolve) => client.productSearchByImage({ im_url: 'http://img.example.com/x.jpg' }, resolve));
    const url = getCalledUrl();
    expect(url).toContain('multisearch-aw.rezolve.com');
    expect(url).toContain('v1/visearch/search_by_image');
  });
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

  test('from using setKeys', async () => {
    const client = ViSearch();
    client.setKeys({
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

    const meta1_next = await getDefaultParamAsyncs(searchClient);
    expect(meta1.code).toEqual(meta1_next.code);
  });
});

describe('search', () => {
  test('search by image url', async () => {
    const res = await new Promise((resolve) => {
      searchClient.productSearchByImage(
        {
          im_url: IM_URL,
          attrs_to_get: ['product_id'],
        },
        (res) => {
          resolve(res);
        },
      );
    });
    await assertSearchSuccess(searchClient, res);
  });
});

describe('recommendations', () => {
  test('search success', async () => {
    window.vsPlacementLoaded = {};
    window.vsPlacementLoaded[process.env.REC_PLACEMENT_ID] = true;
    let pid = '';
    let action = '';

    jest.spyOn(recClient, 'sendEvent').mockImplementation((event, params) => {
      action = event;
      pid = params.pid;
    });

    const res = await new Promise((resolve) => {
      recClient.productSearchById(
        PID,
        {
          attrs_to_get: ['product_id', 'main_image_url'],
        },
        (res) => {
          resolve(res);
        },
      );
    });
    await assertSearchSuccess(recClient, res);
    expect(recClient.sendEvent).toBeCalledTimes(1);
    expect(action).toBe('result_load');
    expect(pid).toBe(process.env.REC_PID);
  });

  test('search with filters in an array success', async () => {
    const res = await new Promise((resolve) => {
      recClient.productSearchById(
        PID,
        {
          filters: ['sale_price:50,500','merchant_category:Shirt OR Jacket OR Dresses']
        },
        (res) => {
          resolve(res);
        },
      );
    });
    await assertSearchSuccess(recClient, res);
  });
});
