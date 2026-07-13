import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from '../renderer/App';

const store = createStore(
  combineReducers({
    selectedServerInstance: (state = null) => state,
    isRunningServers: (state = []) => state,
  }),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ version: '1.0.0.1' }),
  }) as jest.Mock;

  Object.defineProperty(window, 'electron', {
    configurable: true,
    value: {
      ipcRenderer: {
        sendMessage: jest.fn(),
        invoke: jest.fn().mockResolvedValue(false),
        on: jest.fn(),
        once: jest.fn(),
      },
      openExplorer: jest.fn(),
      constant: {
        USER_SERVER_INSTANCES_PATH: () => '/tmp/palserver-test-instances',
      },
      node: {
        path: () => ({
          join: (...parts: string[]) => parts.join('/'),
        }),
        __dirname: () => '/tmp/palserver-gui',
      },
    },
  });
});

describe('App', () => {
  it('should render', () => {
    expect(
      render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <App />
          </Provider>
        </QueryClientProvider>,
      ),
    ).toBeTruthy();
  });
});
