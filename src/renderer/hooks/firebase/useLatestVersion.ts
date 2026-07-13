import { useQuery } from 'react-query';
import { SERVER_URL, VERSION } from '../../../constant/app';
import versionToValue from '../../utils/versionToValue';
import resolveLatestVersion from '../../utils/resolveLatestVersion';

async function fetchLatestAppVersion() {
  try {
    const res = await fetch(`${SERVER_URL}/data/palserver-gui/version`);

    if (!res.ok) {
      return VERSION;
    }

    const data = await res.json();
    return resolveLatestVersion(data.version, VERSION);
  } catch {
    return VERSION;
  }
}

const useLatestVersion = () => {
  const { data: latestVersion } = useQuery(
    'app-version',
    fetchLatestAppVersion,
    {
      staleTime: 1000 * 60,
    },
  );

  return {
    version: latestVersion,
    versionValue: versionToValue(latestVersion || VERSION),
  };
};

export default useLatestVersion;
