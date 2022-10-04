jest.mock('../package.json');
jest.mock('visenze-tracking-javascript');

const va = require('visenze-tracking-javascript');
const ViSearch = require('../js/visearch');
const pjson = require('../package.json');

import { expect, jest, test } from '@jest/globals';

let visearch;
let mockTracker;

let mockCallback;
let mockFailCallback;

function assertThatAutoFillParams(params) {
    expect(params.v).toBe(pjson.version);
    expect(params.sdk).toBe('visearch js sdk');
}

beforeEach(() => {
    visearch = new ViSearch();
    mockTracker = jest.mock();

    va.init = jest.fn(() => {
        return mockTracker;
    })

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

        visearch.prototypes.get_default_tracking_params(mockCallback, mockFailCallback);
        expect(mockCallback).toBeCalledTimes(0);
        expect(mockFailCallback).toBeCalledTimes(1);
    });

    test('default params with auto filled version & sdk', () => {
        mockCallback = jest.fn((defaultParams) => {
            expect(defaultParams.mock_key).toBe('mock_value');
            assertThatAutoFillParams(defaultParams);

            return defaultParams;
        })

        visearch.prototypes.get_default_tracking_params(mockCallback, mockFailCallback);
        expect(mockCallback).toBeCalledTimes(1);
        expect(mockFailCallback).toBeCalledTimes(0);
    });
});

describe('send', () => {
    beforeEach(() => {
        mockTracker.sendEvent = jest.fn();
    });

    test('auto fill version & sdk', () => {
        const action = 'product_view'
        const event1 = {};

        visearch.prototypes.send(action, event1, mockCallback, mockFailCallback);
        assertThatAutoFillParams(event1);
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
        })

        visearch.prototypes.send_events('transaction', [{}]);
        expect(mockTracker.sendEvent).toBeCalledTimes(0);
    });

    test('non-transaction should not autofill transId', () => {
        const action = 'add_to_cart';
        const event1 = {};
        const events = [event1];

        visearch.prototypes.send_events(action, events);

        assertThatAutoFillParams(event1);
        expect(event1.transId).toBe(undefined);

        expect(mockTracker.sendEvent).toBeCalledTimes(1);
    });


    test('upper case transaction', () => {
        const action = 'TRANSACTION';
        const event1 = {};
        const events = [event1];

        visearch.prototypes.send_events(action, events);

        assertThatAutoFillParams(event1);
        expect(event1.transId).toBe(mockUUID);

        expect(mockTracker.sendEvent).toBeCalledTimes(1);
    });

    test('auto fill version & sdk', () => {
        const action = 'transaction';
        const event1 = {};
        const event2 = { transId: 'sample-transId' };
        const event3 = {};
        const events = [event1, event2, event3];

        visearch.prototypes.send_events(action, events);

        assertThatAutoFillParams(event1);
        assertThatAutoFillParams(event2);
        expect(event1.transId).toBe(mockUUID);
        expect(event2.transId).toBe('sample-transId');
        expect(event3.transId).toBe(mockUUID);

        expect(mockTracker.sendEvent).toBeCalledTimes(3);
    });
});
