import normalizeRestSettingsResponse from '../main/services/remote/normalizeRestSettingsResponse';
import sampleResponse from './fixtures/rest-settings-sample.json';

describe('normalizeRestSettingsResponse', () => {
  it('returns an empty object for invalid responses', () => {
    expect(normalizeRestSettingsResponse(null)).toEqual({
      settings: {},
      unknownKeys: [],
    });
    expect(normalizeRestSettingsResponse([])).toEqual({
      settings: {},
      unknownKeys: [],
    });
  });

  it('normalizes the REST settings sample fixture', () => {
    const { settings } = normalizeRestSettingsResponse(sampleResponse);

    expect(settings.ExpRate).toBe(1.5);
    expect(settings.ServerName).toBe('Tier 2 Test Server');
    expect(settings.CrossplayPlatforms).toBe('(Steam,Xbox,PS5,Mac)');
    expect(settings.bIsPvP).toBe(false);
    expect(settings.RESTAPIEnabled).toBe(true);
    expect(settings.CustomFutureField).toBe('keep-me');
  });

  it('maps AllowConnectPlatform to CrossplayPlatforms', () => {
    const { settings } = normalizeRestSettingsResponse({
      AllowConnectPlatform: '(Steam)',
    });

    expect(settings.CrossplayPlatforms).toBe('(Steam)');
  });

  it('coerces string booleans and numbers', () => {
    const { settings } = normalizeRestSettingsResponse({
      bIsPvP: 'false',
      ExpRate: '2',
      RESTAPIPort: '8212',
    });

    expect(settings.bIsPvP).toBe(false);
    expect(settings.ExpRate).toBe(2);
    expect(settings.RESTAPIPort).toBe(8212);
  });

  it('reports unknown keys when a known-key set is provided', () => {
    const knownKeys = new Set(['ExpRate', 'ServerName']);
    const { unknownKeys } = normalizeRestSettingsResponse(sampleResponse, knownKeys);

    expect(unknownKeys).toContain('CustomFutureField');
    expect(unknownKeys).not.toContain('ExpRate');
  });
});
