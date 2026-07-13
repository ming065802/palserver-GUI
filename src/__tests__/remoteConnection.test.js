import { buildRemoteServerInstanceSetting } from '../main/services/remote/buildRemoteServerInstanceSetting';
import {
  classifyRemoteConnectionError,
  normalizeRemoteHost,
} from '../main/services/remote/testRemoteConnection';

describe('normalizeRemoteHost', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeRemoteHost(' 203.0.113.10 ')).toBe('203.0.113.10');
  });
});

describe('classifyRemoteConnectionError', () => {
  it('classifies auth failures', () => {
    expect(
      classifyRemoteConnectionError({
        isAxiosError: true,
        response: { status: 401 },
      }),
    ).toEqual({
      errorCode: 'AUTH_FAILED',
      error: 'Admin password is incorrect',
    });
  });

  it('classifies DNS failures', () => {
    expect(
      classifyRemoteConnectionError({
        isAxiosError: true,
        code: 'ENOTFOUND',
      }),
    ).toEqual({
      errorCode: 'CONNECTION_FAILED',
      error: 'Unable to resolve the remote host name',
    });
  });

  it('classifies refused connections', () => {
    expect(
      classifyRemoteConnectionError({
        isAxiosError: true,
        code: 'ECONNREFUSED',
      }),
    ).toEqual({
      errorCode: 'CONNECTION_FAILED',
      error: 'Unable to reach the remote REST API port',
    });
  });
});

describe('buildRemoteServerInstanceSetting', () => {
  it('creates metadata-only remote instance defaults', () => {
    const { serverInstanceSetting, remoteSettings } =
      buildRemoteServerInstanceSetting('/instances', 'sr-test', {
        ServerName: 'VPS Server',
        PublicIP: '203.0.113.10',
        RESTAPIPort: 18212,
        RCONPort: 25576,
        AdminPassword: 'secret',
        RCONEnabled: true,
      });

    expect(serverInstanceSetting).toMatchObject({
      serverId: 'sr-test',
      isRemote: true,
      remoteHost: '203.0.113.10',
      remoteRestPort: 18212,
      remoteRconPort: 25576,
      modManagementEnabled: false,
      LogEnabled: false,
      ue4ssEnabled: false,
      palguardEnabled: false,
    });
    expect(serverInstanceSetting.serverPath).toBe(serverInstanceSetting.instancePath);

    expect(remoteSettings).toEqual({
      ServerName: 'VPS Server',
      PublicIP: '203.0.113.10',
      RESTAPIPort: 18212,
      RCONPort: 25576,
      AdminPassword: 'secret',
      RESTAPIEnabled: true,
      RCONEnabled: true,
    });
  });

  it('uses default ports when omitted', () => {
    const { serverInstanceSetting, remoteSettings } =
      buildRemoteServerInstanceSetting('/instances', 'sr-test', {
        ServerName: 'VPS Server',
        PublicIP: 'vps.example.com',
        AdminPassword: 'secret',
      });

    expect(serverInstanceSetting.remoteRestPort).toBe(8212);
    expect(serverInstanceSetting.remoteRconPort).toBe(25575);
    expect(remoteSettings.RESTAPIPort).toBe(8212);
    expect(remoteSettings.RCONPort).toBe(25575);
    expect(remoteSettings.RCONEnabled).toBe(false);
  });
});
