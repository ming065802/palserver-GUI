import { useQuery } from 'react-query';
import { LATEST_GAME_VERSION, SERVER_URL } from '../../../constant/app';
import versionToValue from '../../utils/versionToValue';
import resolveLatestVersion from '../../utils/resolveLatestVersion';

async function fetchLatestGameVersion() {
  try {
    const res = await fetch(`${SERVER_URL}/data/palworld/version`);

    if (!res.ok) {
      return LATEST_GAME_VERSION;
    }

    const data = await res.json();
    return resolveLatestVersion(data.version, LATEST_GAME_VERSION);
  } catch {
    return LATEST_GAME_VERSION;
  }
}

const useLatestGameVersion = () => {
  const { data: latestVersion } = useQuery(
    'game-version',
    fetchLatestGameVersion,
    {
      staleTime: 1000 * 60,
    },
  );

  return {
    version: latestVersion,
    versionValue: versionToValue(latestVersion || LATEST_GAME_VERSION),
  };
};

export default useLatestGameVersion;
