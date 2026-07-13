import fs from 'fs/promises';
import palServerSettingConverter from '../../utils/palServerSettingConverter';

export default async function writeWorldSettingsini(
  worldOptionsiniPath: string,
  worldOptionsiniJson: any,
) {
  const optionSettings = palServerSettingConverter.format(worldOptionsiniJson);
  const worldOptionsiniText = `[/Script/Pal.PalGameWorldSettings]\nOptionSettings=${optionSettings}`;

  await fs.writeFile(worldOptionsiniPath, worldOptionsiniText, {
    encoding: 'utf-8',
  });
}
