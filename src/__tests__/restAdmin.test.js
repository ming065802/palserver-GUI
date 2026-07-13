import {
  getRestAdminConfig,
  isRestApiEnabled,
} from '../main/services/admin/restAdmin';
import { LOCALHOST } from '../main/services/admin/adminConnectionConfig';

describe('getRestAdminConfig', () => {
  it('includes host with default localhost', () => {
    expect(
      getRestAdminConfig({
        RESTAPIPort: 8212,
        AdminPassword: '"secret"',
      }),
    ).toEqual({
      host: LOCALHOST,
      port: 8212,
      password: 'secret',
    });
  });

  it('uses provided host for remote connections', () => {
    expect(
      getRestAdminConfig(
        {
          RESTAPIPort: 18212,
          AdminPassword: 'remote-pass',
        },
        '203.0.113.10',
      ),
    ).toEqual({
      host: '203.0.113.10',
      port: 18212,
      password: 'remote-pass',
    });
  });
});

describe('isRestApiEnabled', () => {
  it('returns true only when RESTAPIEnabled is true', () => {
    expect(isRestApiEnabled({ RESTAPIEnabled: true })).toBe(true);
    expect(isRestApiEnabled({ RESTAPIEnabled: false })).toBe(false);
    expect(isRestApiEnabled({})).toBe(false);
  });
});

describe('restGetSettings', () => {
  it('is exported from restAdmin', async () => {
    const { restGetSettings } = await import('../main/services/admin/restAdmin');
    expect(typeof restGetSettings).toBe('function');
  });
});
