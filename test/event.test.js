jest.mock('../package.json');
jest.mock('visenze-tracking-javascript');

import va from 'visenze-tracking-javascript';
import { ViSearch } from '../src/visearch';
import { version } from '../src/version'
import { expect, test, jest } from '@jest/globals';

let visearch;
let mockTracker;

let mockCallback;
let mockFailCallback;

function assertThatAutoFillParams (params) {
  expect(params.v).toBe(version);
  expect(params.sdk).toBe('visearch js sdk');
}

beforeEach(() => {
  visearch = ViSearch();
  mockTracker = jest.mock();

  va.init = jest.fn(() => {
    return mockTracker;
  });

  mockCallback = jest.fn();
  mockFailCallback = jest.fn();
});

describe('get_default_tracking_params', () => {
  beforeEach(() => {
    mockTracker.getDefaultParams = jest.fn(() => {
      return { mock_key: 'mock_value' };
    });
  });

  test('fail to init tracker', () => {
    mockTracker = null;

    mockFailCallback = jest.fn((error) => {
      expect(error instanceof Error).toBe(true);
      expect(error.message).toBe('Tracker is not found');
    });

    visearch.get_default_tracking_params(
      mockCallback,
      mockFailCallback
    );
    expect(mockCallback).toBeCalledTimes(0);
    expect(mockFailCallback).toBeCalledTimes(1);
  });

  test('default params with auto filled version & sdk', () => {
    mockCallback = jest.fn((defaultParams) => {
      expect(defaultParams.mock_key).toBe('mock_value');
      assertThatAutoFillParams(defaultParams);

      return defaultParams;
    });

    visearch.get_default_tracking_params(
      mockCallback,
      mockFailCallback
    );
    expect(mockCallback).toBeCalledTimes(1);
    expect(mockFailCallback).toBeCalledTimes(0);
  });
});

describe('send', () => {
  beforeEach(() => {
    mockTracker.sendEvent = jest.fn();
  });

  test('auto fill version & sdk', () => {
    const action = 'product_view';
    const event1 = {};
    mockCallback = jest.fn((params) => {
      assertThatAutoFillParams(params);
      return params;
    });

    visearch.send(action, event1, mockCallback, mockFailCallback);
    expect(mockTracker.sendEvent).toBeCalledTimes(1);
  });
});

describe('send_events', () => {
  const mockUUID = 'mock-uuid';
  beforeEach(() => {
    mockTracker.validateEvents = jest.fn(() => {
      return true;
    });

    mockTracker.sendEvent = jest.fn();

    mockTracker.generateUUID = jest.fn(() => {
      return mockUUID;
    });
  });

  test('invalid events', () => {
    mockTracker.validateEvents = jest.fn(() => {
      return false;
    });

    visearch.send_events('transaction', [{}]);
    expect(mockTracker.sendEvent).toBeCalledTimes(0);
  });

  test('non-transaction should not autofill transId', () => {
    const action = 'add_to_cart';
    const event1 = {};
    const events = [event1];

    visearch.send_events(action, events);

    expect(mockTracker.sendEvent).toBeCalledTimes(1);
    expect(mockTracker.sendEvent).toBeCalledWith('add_to_cart',
      { "sdk": "visearch js sdk", "v": version }
      , expect.any(Function), expect.any(Function));
  });

  test('upper case transaction', () => {
    const action = 'TRANSACTION';
    const event1 = {};
    const events = [event1];

    visearch.send_events(action, events);

    expect(mockTracker.sendEvent).toBeCalledTimes(1);
    expect(mockTracker.sendEvent).toBeCalledWith('TRANSACTION',
      { "sdk": "visearch js sdk", "v": version, transId: mockUUID }
      , expect.any(Function), expect.any(Function));
  });

  test('auto fill version & sdk', () => {
    const action = 'transaction';
    const event1 = {};
    const event2 = { transId: 'sample-transId' };
    const event3 = {};
    const events = [event1, event2, event3];

    visearch.send_events(action, events);

    expect(mockTracker.sendEvent).toBeCalledTimes(3);
    expect(mockTracker.sendEvent)
      .toBeCalledWith('transaction',
        { "sdk": "visearch js sdk", "v": version, transId: mockUUID }
        , expect.any(Function), expect.any(Function));
    expect(mockTracker.sendEvent)
      .toBeCalledWith('transaction',
        { "sdk": "visearch js sdk", "v": version, transId: 'sample-transId' }
        , expect.any(Function), expect.any(Function));
  });
});
