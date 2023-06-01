import { jest } from '@jest/globals';

//jest.spyOn(global.console, 'log').mockImplementation(() => { });
jest.spyOn(global.console, 'error').mockImplementation(() => {});
