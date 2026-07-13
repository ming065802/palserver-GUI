/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Channels from '../main/ipcs/channels';
import RemoteUnbanPanel from '../renderer/components/ServerManagement/ServerPlayers/RemoteUnbanPanel';
import { restUnbanPlayer } from '../renderer/utils/restAdmin';
import normalizeRemoteUnbanUserId from '../renderer/utils/normalizeRemoteUnbanUserId';
import { restUnban } from '../main/services/admin/restAdmin';

jest.mock('axios');

const mockedAxios = axios;

const store = createStore((state = { selectedServerInstance: 'sr-remote-1' }) => state);

const translationState = {
  language: 'en',
  translations: {
    en: {
      RemoteBanListNotAvailable: 'Remote ban list unavailable.',
      RemoteUnbanSteamIdLabel: 'Steam ID / UserId',
      RemoteUnbanSteamIdPlaceholder: 'Enter Steam ID',
      RemoteUnbanSuccess: 'Unban request sent successfully.',
      RemoteUnbanFailed: 'Failed to unban.',
      RemoteUnbanAuthFailed: 'Admin password is incorrect.',
      RemoteUnbanEmptyId: 'Please enter a Steam ID.',
      UnBan: 'Unban',
    },
  },
};

jest.mock('../renderer/hooks/translation/useTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key) => translationState.translations.en[key] || key,
    language: translationState.language,
  }),
}));

function renderRemoteUnbanPanel() {
  return render(
    <Provider store={store}>
      <RemoteUnbanPanel />
    </Provider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();

  Object.defineProperty(window, 'electron', {
    configurable: true,
    value: {
      ipcRenderer: {
        invoke: jest.fn().mockResolvedValue({}),
        sendMessage: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
      },
    },
  });
});

describe('normalizeRemoteUnbanUserId', () => {
  it('returns empty string for blank input', () => {
    expect(normalizeRemoteUnbanUserId('')).toBe('');
    expect(normalizeRemoteUnbanUserId('   ')).toBe('');
  });

  it('prepends steam_ when only the numeric id is provided', () => {
    expect(normalizeRemoteUnbanUserId('76561198123456789')).toBe(
      'steam_76561198123456789',
    );
  });

  it('normalizes steam_ prefix case-insensitively', () => {
    expect(normalizeRemoteUnbanUserId('STEAM_76561198123456789')).toBe(
      'steam_76561198123456789',
    );
  });
});

describe('restUnbanPlayer', () => {
  it('posts to /unban through sendRestAPI', async () => {
    await restUnbanPlayer('sr-remote-1', 'steam_76561198123456789');

    expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
      Channels.sendRestAPI,
      'sr-remote-1',
      '/unban',
      {
        method: 'post',
        body: { userid: 'steam_76561198123456789' },
      },
    );
  });
});

describe('restUnban', () => {
  it('posts userid to the remote REST endpoint', async () => {
    mockedAxios.mockResolvedValue({ data: {} });

    await restUnban(
      {
        host: '203.0.113.10',
        port: 8212,
        password: 'remote-pass',
      },
      'steam_76561198123456789',
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      'http://203.0.113.10:8212/v1/api/unban',
      {
        method: 'post',
        auth: {
          username: 'admin',
          password: 'remote-pass',
        },
        data: { userid: 'steam_76561198123456789' },
      },
    );
  });

  it('propagates 401 errors from the REST endpoint', async () => {
    mockedAxios.mockRejectedValue({
      response: { status: 401 },
      message: 'Request failed with status code 401',
    });

    await expect(
      restUnban(
        {
          host: '203.0.113.10',
          port: 8212,
          password: 'wrong-pass',
        },
        'steam_76561198123456789',
      ),
    ).rejects.toMatchObject({
      response: { status: 401 },
    });
  });
});

describe('RemoteUnbanPanel', () => {
  it('shows validation error when submitting an empty Steam ID', async () => {
    renderRemoteUnbanPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Unban' }));

    expect(await screen.findByText('Please enter a Steam ID.')).toBeInTheDocument();
    expect(window.electron.ipcRenderer.invoke).not.toHaveBeenCalled();
  });

  it('sends unban request for a normalized Steam ID', async () => {
    renderRemoteUnbanPanel();

    fireEvent.change(screen.getByLabelText('Steam ID / UserId'), {
      target: { value: '76561198123456789' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unban' }));

    await waitFor(() => {
      expect(window.electron.ipcRenderer.invoke).toHaveBeenCalledWith(
        Channels.sendRestAPI,
        'sr-remote-1',
        '/unban',
        {
          method: 'post',
          body: { userid: 'steam_76561198123456789' },
        },
      );
    });

    expect(
      await screen.findByText('Unban request sent successfully.'),
    ).toBeInTheDocument();
  });

  it('shows auth error when unban request is rejected with 401', async () => {
    window.electron.ipcRenderer.invoke.mockRejectedValue(
      new Error('Request failed with status code 401'),
    );

    renderRemoteUnbanPanel();

    fireEvent.change(screen.getByLabelText('Steam ID / UserId'), {
      target: { value: 'steam_76561198123456789' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unban' }));

    expect(
      await screen.findByText('Admin password is incorrect.'),
    ).toBeInTheDocument();
  });
});
