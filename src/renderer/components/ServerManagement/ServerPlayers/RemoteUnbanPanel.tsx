import { Button, Callout, Flex, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import useTranslation from '../../../hooks/translation/useTranslation';
import useSelectedServerInstance from '../../../redux/selectedServerInstance/useSelectedServerInstance';
import { restUnbanPlayer } from '../../../utils/restAdmin';
import normalizeRemoteUnbanUserId from '../../../utils/normalizeRemoteUnbanUserId';

type UnbanStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function RemoteUnbanPanel() {
  const { t } = useTranslation();
  const { selectedServerInstance } = useSelectedServerInstance();
  const [userIdInput, setUserIdInput] = useState('');
  const [status, setStatus] = useState<UnbanStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const resetFeedback = () => {
    if (status !== 'idle') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUnban = async () => {
    const userId = normalizeRemoteUnbanUserId(userIdInput);
    if (!userId) {
      setStatus('error');
      setErrorMessage(t('RemoteUnbanEmptyId'));
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await restUnbanPlayer(selectedServerInstance, userId);
      setStatus('success');
      setUserIdInput('');
    } catch (error) {
      setStatus('error');
      const message =
        error instanceof Error && /401|unauthorized/i.test(error.message)
          ? t('RemoteUnbanAuthFailed')
          : t('RemoteUnbanFailed');
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Callout.Root color="amber" size="1">
        <Callout.Text>{t('RemoteBanListNotAvailable')}</Callout.Text>
      </Callout.Root>

      <div className="flex flex-col gap-2 px-1">
        <Text as="label" size="2" weight="medium" htmlFor="remote-unban-user-id">
          {t('RemoteUnbanSteamIdLabel')}
        </Text>
        <Flex gap="2" align="end" wrap="wrap">
          <TextField.Root
            id="remote-unban-user-id"
            className="min-w-[240px] flex-1"
            placeholder={t('RemoteUnbanSteamIdPlaceholder')}
            value={userIdInput}
            disabled={status === 'submitting'}
            onChange={(event) => {
              setUserIdInput(event.target.value);
              resetFeedback();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleUnban();
              }
            }}
          />
          <Button
            onClick={handleUnban}
            disabled={status === 'submitting'}
            size="2"
          >
            {t('UnBan')}
          </Button>
        </Flex>
      </div>

      {status === 'success' && (
        <Callout.Root color="green" size="1">
          <Callout.Text>{t('RemoteUnbanSuccess')}</Callout.Text>
        </Callout.Root>
      )}
      {status === 'error' && errorMessage && (
        <Callout.Root color="red" size="1">
          <Callout.Text>{errorMessage}</Callout.Text>
        </Callout.Root>
      )}
    </div>
  );
}
