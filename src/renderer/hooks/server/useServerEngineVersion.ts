import useLocalState from '../useLocalState';

const useServerEngineVersion = () => {
  const [serverEngineVersion, setServerEngineVersion] = useLocalState<string>(
    'server-engine-version',
    '',
  );

  return [serverEngineVersion, setServerEngineVersion] as const;
};

export default useServerEngineVersion;
