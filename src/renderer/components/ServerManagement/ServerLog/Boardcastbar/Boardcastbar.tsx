/* eslint-disable no-use-before-define */
import {
  AlertDialog,
  Button,
  Dialog,
  TextField,
  Theme,
} from '@radix-ui/themes';
import React, { useState } from 'react';
import useTranslation from '../../../../hooks/translation/useTranslation';
import Channels from '../../../../../main/ipcs/channels';
import useSelectedServerInstance from '../../../../redux/selectedServerInstance/useSelectedServerInstance';
import Schedule from './Schedule/Schedule';
import {
  restAnnounce,
  restGetServerInfo,
  restSaveWorld,
  restShutdownServer,
} from '../../../../utils/restAdmin';

export default function Boardcastbar() {
  const { t } = useTranslation();
  const { selectedServerInstance } = useSelectedServerInstance();

  const [input, setInput] = useState('');

  const handleConfirm = () => {
    if (input.trim()) {
      if (input.startsWith('/')) {
        handleSendCommand();
      } else {
        handleSendBoardCast();
      }
    }
    setInput('');
  };

  const handleSendCommand = async () => {
    const command = input.slice(1).trim();
    const lowerCommand = command.toLowerCase();

    try {
      if (lowerCommand === 'save') {
        await restSaveWorld(selectedServerInstance);
        window.electron.ipcRenderer.sendMessage('alert', 'Save requested');
        return;
      }

      if (lowerCommand.startsWith('shutdown')) {
        const waitTime = Number(command.split(/\s+/u)[1]) || 60;
        await restShutdownServer(
          selectedServerInstance,
          waitTime,
          'Server shutting down',
        );
        window.electron.ipcRenderer.sendMessage('alert', 'Shutdown requested');
        return;
      }

      if (lowerCommand === 'info') {
        const info = await restGetServerInfo(selectedServerInstance);
        window.electron.ipcRenderer.sendMessage(
          'alert',
          JSON.stringify(info, null, 2),
        );
        return;
      }

      const response = await window.electron.ipcRenderer.invoke(
        Channels.sendRCONCommand,
        selectedServerInstance,
        command,
      );
      window.electron.ipcRenderer.sendMessage('alert', response);
    } catch (error) {
      window.electron.ipcRenderer.sendMessage('alert', String(error));
    }
  };

  const handleSendBoardCast = () => {
    restAnnounce(selectedServerInstance, input);
  };

  const [openSchedule, setOpenSchedule] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* 設定 */}
        <div className="flex items-center justify-end gap-2">
          {/* <AlertDialog.Trigger>
            <Button
              size="1"
              color="gray"
              onClick={() => {
                setOpenSchedule(true);
              }}
            >
              {t('Schedule')}
            </Button>
          </AlertDialog.Trigger>
          <Button size="1" color="gray">
            {t('CommandsList')}
          </Button> */}
          <Button
            size="1"
            color="gray"
            onClick={() => {
              window.electron.openExplorer(
                window.electron.node
                  .path()
                  .join(
                    window.electron.constant.USER_SERVER_INSTANCES_PATH(),
                    selectedServerInstance,
                    'server/Pal/Binaries/Win64/PalDefender/logs',
                  ),
              );
            }}
          >
            {t('LogFolder')}
          </Button>
        </div>
        <div>
          {/* 輸入欄 */}
          <Theme
            appearance="dark"
            style={{ background: 'inherit', fontFamily: 'inherit' }}
          >
            <TextField.Root
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              size="3"
              placeholder={t('EnterCommandOrBoardCast')}
              style={{ fontFamily: 'inherit' }}
            />
          </Theme>
        </div>
      </div>
      {openSchedule && <Schedule />}
    </>
  );
}
