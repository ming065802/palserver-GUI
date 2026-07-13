import { ReactNode } from 'react';
import { Redirect } from 'react-router-dom';
import useIsRemote from '../hooks/server/useIsRemote';

type Props = {
  children: ReactNode;
  redirectTo?: string;
  allowRemote?: boolean;
};

export default function RemoteUnsupportedGuard({
  children,
  redirectTo = '/server-management',
  allowRemote = false,
}: Props) {
  const isRemote = useIsRemote();

  if (isRemote && !allowRemote) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}
