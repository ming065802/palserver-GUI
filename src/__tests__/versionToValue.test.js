import versionToValue, { isVersionOlder } from '../renderer/utils/versionToValue';

describe('versionToValue', () => {
  it('pads version segments for stable comparison', () => {
    expect(versionToValue('1.0.0.1')).toBe('000001.000000.000000.000001');
    expect(versionToValue('0.4.15.12345')).toBe(
      '000000.000004.000015.012345',
    );
  });

  it('compares four-part versions correctly', () => {
    expect(isVersionOlder('0.4.15.12345', '1.0.0.1')).toBe(true);
    expect(isVersionOlder('1.0.0.1', '0.4.15.12345')).toBe(false);
    expect(isVersionOlder('1.0.0.1', '1.0.0.1')).toBe(false);
  });
});
