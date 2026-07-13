import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import writeWorldSettingsini from '../main/services/worldSettings/writeWorldSettingsini';
import readWorldSettingsini from '../main/services/worldSettings/readWorldSettingsini';

describe('world settings ini round-trip', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'palserver-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('writes and reads Palworld 1.0 style settings including CrossplayPlatforms', async () => {
    const iniPath = path.join(tempDir, 'PalWorldSettings.ini');
    const settings = {
      ServerName: 'Test Server',
      CrossplayPlatforms: '(Steam,Xbox,PS5,Mac)',
      AdminPassword: 'admin-pass',
      RCONEnabled: true,
      RESTAPIEnabled: true,
      RESTAPIPort: 8212,
      ExpRate: 1.5,
      DeathPenalty: 'Item',
      bIsStartLocationSelectByMap: false,
    };

    await writeWorldSettingsini(iniPath, settings);

    const content = await fs.readFile(iniPath, 'utf-8');
    expect(content).toBe(
      `[/Script/Pal.PalGameWorldSettings]\nOptionSettings=${'(ServerName="Test Server",CrossplayPlatforms=(Steam,Xbox,PS5,Mac),AdminPassword="admin-pass",RCONEnabled=True,RESTAPIEnabled=True,RESTAPIPort=8212,ExpRate=1.5,DeathPenalty=Item,bIsStartLocationSelectByMap=False)'}`,
    );

    const parsed = await readWorldSettingsini(iniPath);
    expect(parsed).toEqual(settings);
  });

  it('preserves quoted server names with commas through round-trip', async () => {
    const iniPath = path.join(tempDir, 'PalWorldSettings.ini');
    const settings = {
      ServerName: 'My Server, PvE',
      ServerPassword: '',
      PublicPort: 8211,
    };

    await writeWorldSettingsini(iniPath, settings);
    const parsed = await readWorldSettingsini(iniPath);

    expect(parsed.ServerName).toBe('My Server, PvE');
    expect(parsed.PublicPort).toBe(8211);
  });
});
