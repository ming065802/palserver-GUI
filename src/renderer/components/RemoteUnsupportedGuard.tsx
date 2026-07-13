import { Redirect } from 'react-router-dom';
import { ReactNode } from 'react';
import useIsRemote from '../hooks/server/useIsRemote';

type Props = {
  children: ReactNode;
  redirectTo?: string;
};

export default function RemoteUnsupportedGuard({
  children,
  redirectTo = '/server-management',
}: Props) {
  const isRemote = useIsRemote();

  if (isRemote) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}
