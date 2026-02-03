export const init = jest.fn();
export const wrap = jest.fn((component: any) => component);
export const captureException = jest.fn();
export const captureMessage = jest.fn();
export const setUser = jest.fn();
export const setContext = jest.fn();
export const addBreadcrumb = jest.fn();
export const withScope = jest.fn((cb: any) => cb({ setExtra: jest.fn(), setTag: jest.fn() }));
export const ReactNavigationInstrumentation = jest.fn().mockImplementation(() => ({
  registerNavigationContainer: jest.fn(),
}));
export const ReactNativeTracing = jest.fn();
