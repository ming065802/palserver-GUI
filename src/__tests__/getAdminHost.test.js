import {
  DEFAULT_RCON_PORT,
  DEFAULT_REST_PORT,
  LOCALHOST,
  getRconOptions,
  resolveAdminConnectionConfig,
} from '../main/services/admin/adminConnectionConfig';

describe('resolveAdminConnectionConfig', () => {
  it('returns localhost connection for local instances', () => {
    expect(
      resolveAdminConnectionConfig(
        { isRemote: false },
        {
          RESTAPIPort: 8212,
          RCONPort: 25575,
          AdminPassword: '"secret"',
        },
      ),
    ).toEqual({
      host: LOCALHOST,
      restPort: 8212,
      rconPort: 25575,
      adminPassword: 'secret',
    });
  });

  it('uses defaults when local world settings omit ports', () => {
    expect(resolveAdminConnectionConfig({ isRemote: false }, {})).toEqual({
      host: LOCALHOST,
      restPort: DEFAULT_REST_PORT,
      rconPort: DEFAULT_RCON_PORT,
      adminPassword: '',
    });
  });

  it('returns remote host and ports from remote settings', () => {
    expect(
      resolveAdminConnectionConfig(
        { isRemote: true },
        {
          PublicIP: '203.0.113.10',
          RESTAPIPort: 18212,
          RCONPort: 25576,
          AdminPassword: 'remote-pass',
        },
      ),
    ).toEqual({
      host: '203.0.113.10',
      restPort: 18212,
      rconPort: 25576,
      adminPassword: 'remote-pass',
    });
  });

  it('prefers .pal remoteHost and port overrides over remote-settings.json', () => {
    expect(
      resolveAdminConnectionConfig(
        {
          isRemote: true,
          remoteHost: 'vps.example.com',
          remoteRestPort: 9212,
          remoteRconPort: 35575,
        },
        {
          PublicIP: '203.0.113.10',
          RESTAPIPort: 18212,
          RCONPort: 25576,
          AdminPassword: 'remote-pass',
        },
      ),
    ).toEqual({
      host: 'vps.example.com',
      restPort: 9212,
      rconPort: 35575,
      adminPassword: 'remote-pass',
    });
  });
});

describe('getRconOptions', () => {
  it('maps admin connection config to RCON client options', () => {
    expect(
      getRconOptions({
        host: '203.0.113.10',
        restPort: 8212,
        rconPort: 25575,
        adminPassword: 'secret',
      }),
    ).toEqual({
      ipAddress: '203.0.113.10',
      port: 25575,
      password: 'secret',
    });
  });
});
