import palServerSettingConverter from '../main/utils/palServerSettingConverter';

describe('palServerSettingConverter', () => {
  describe('parse', () => {
    it('parses booleans and numbers', () => {
      const input =
        '(RCONEnabled=True,RESTAPIEnabled=False,ExpRate=1.500000,ServerPlayerMaxNum=16)';
      expect(palServerSettingConverter.parse(input)).toEqual({
        RCONEnabled: true,
        RESTAPIEnabled: false,
        ExpRate: 1.5,
        ServerPlayerMaxNum: 16,
      });
    });

    it('parses quoted strings with commas', () => {
      const input =
        '(ServerName="My Server, PvE",AdminPassword="secret",ServerPassword="")';
      expect(palServerSettingConverter.parse(input)).toEqual({
        ServerName: 'My Server, PvE',
        AdminPassword: 'secret',
        ServerPassword: '',
      });
    });

    it('parses CrossplayPlatforms tuple without breaking on inner commas', () => {
      const input =
        '(CrossplayPlatforms=(Steam,Xbox,PS5,Mac),RCONPort=25575,RESTAPIPort=8212)';
      expect(palServerSettingConverter.parse(input)).toEqual({
        CrossplayPlatforms: '(Steam,Xbox,PS5,Mac)',
        RCONPort: 25575,
        RESTAPIPort: 8212,
      });
    });

    it('parses mixed settings from a realistic 1.0 line', () => {
      const input =
        '(ServerName="Test Server",CrossplayPlatforms=(Steam,Xbox,PS5,Mac),DeathPenalty=Item,PalEggDefaultHatchingTime=1.000000,bIsStartLocationSelectByMap=False)';
      expect(palServerSettingConverter.parse(input)).toEqual({
        ServerName: 'Test Server',
        CrossplayPlatforms: '(Steam,Xbox,PS5,Mac)',
        DeathPenalty: 'Item',
        PalEggDefaultHatchingTime: 1,
        bIsStartLocationSelectByMap: false,
      });
    });

    it('returns empty object for empty input', () => {
      expect(palServerSettingConverter.parse('')).toEqual({});
      expect(palServerSettingConverter.parse(undefined)).toEqual({});
    });
  });

  describe('format', () => {
    it('formats booleans, numbers, and quoted strings', () => {
      const output = palServerSettingConverter.format({
        RCONEnabled: true,
        RESTAPIEnabled: false,
        ExpRate: 1.5,
        ServerName: 'Test Server',
      });
      expect(output).toBe(
        '(RCONEnabled=True,RESTAPIEnabled=False,ExpRate=1.5,ServerName="Test Server")',
      );
    });

    it('preserves CrossplayPlatforms tuple formatting', () => {
      const output = palServerSettingConverter.format({
        CrossplayPlatforms: '(Steam,Xbox,PS5,Mac)',
        RCONPort: 25575,
        RESTAPIPort: 8212,
      });
      expect(output).toBe(
        '(CrossplayPlatforms=(Steam,Xbox,PS5,Mac),RCONPort=25575,RESTAPIPort=8212)',
      );
    });

    it('quotes values that contain commas', () => {
      const output = palServerSettingConverter.format({
        ServerName: 'My Server, PvE',
      });
      expect(output).toBe('(ServerName="My Server, PvE")');
    });

    it('round-trips tuple and quoted values', () => {
      const original =
        '(ServerName="Guild World",CrossplayPlatforms=(Steam,Xbox),AdminPassword="admin-pass",RCONEnabled=True,PublicPort=8211)';
      const parsed = palServerSettingConverter.parse(original);
      const formatted = palServerSettingConverter.format(parsed);
      const reparsed = palServerSettingConverter.parse(formatted);

      expect(reparsed).toEqual(parsed);
    });
  });
});
