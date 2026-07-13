import resolveLatestVersion from '../renderer/utils/resolveLatestVersion';

describe('resolveLatestVersion', () => {
  it('returns bundled version when remote is missing', () => {
    expect(resolveLatestVersion(undefined, '1.0.0.1')).toBe('1.0.0.1');
    expect(resolveLatestVersion('', '1.2.0')).toBe('1.2.0');
  });

  it('ignores stale remote Palworld version below 1.0 baseline', () => {
    expect(resolveLatestVersion('0.5.1', '1.0.0.1')).toBe('1.0.0.1');
    expect(resolveLatestVersion('0.4.11', '1.0.0.1')).toBe('1.0.0.1');
  });

  it('keeps newer remote versions', () => {
    expect(resolveLatestVersion('1.0.0.2', '1.0.0.1')).toBe('1.0.0.2');
    expect(resolveLatestVersion('1.3.0', '1.2.0')).toBe('1.3.0');
  });

  it('returns bundled version when remote lags behind current app release', () => {
    expect(resolveLatestVersion('1.1.0', '1.2.0')).toBe('1.2.0');
  });
});
