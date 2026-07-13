import { Select, Switch, Text, TextField, Theme } from '@radix-ui/themes';
import React from 'react';
import useTranslation from '../../../hooks/translation/useTranslation';
import useSelectedServerInstance from '../../../redux/selectedServerInstance/useSelectedServerInstance';
import useServerInfo from '../../../hooks/server/info/useServerInfo';
import useIsRemote from '../../../hooks/server/useIsRemote';
import {
  DailySchedule,
  DEFAULT_DAILY_SCHEDULE,
  normalizeDailySchedule,
  normalizeTimeString,
} from '../../../../types/DailySchedule.types';
import { ServerInstanceSetting } from '../../../../types/ServerInstanceSetting.types';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, '0'),
);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, '0'),
);

type ScheduleField = 'scheduledStop' | 'scheduledStart' | 'scheduledRestart';

function parseTimeParts(time: string) {
  const normalized = normalizeTimeString(time);
  const [hour, minute] = normalized.split(':');
  return { hour, minute };
}

function buildTime(hour: string, minute: string) {
  return normalizeTimeString(`${hour}:${minute}`);
}

export default function ServerSchedule() {
  const { t } = useTranslation();
  const isRemote = useIsRemote();
  const { selectedServerInstance } = useSelectedServerInstance();
  const { serverInfo, setServerInfo } = useServerInfo(selectedServerInstance);

  if (!serverInfo) {
    return null;
  }

  const updateSchedule = (
    field: ScheduleField,
    patch: Partial<DailySchedule>,
  ) => {
    const current = normalizeDailySchedule(serverInfo[field]);
    const nextSchedule: DailySchedule = {
      ...current,
      ...patch,
    };

    setServerInfo({
      ...serverInfo,
      [field]: nextSchedule,
    } as ServerInstanceSetting);
  };

  const schedules: Array<{
    field: ScheduleField;
    title: string;
    description: string;
    showWarning: boolean;
    hidden?: boolean;
  }> = [
    {
      field: 'scheduledStop',
      title: t('ScheduledStop'),
      description: isRemote
        ? t('ScheduledStopRemoteDesc')
        : t('ScheduledStopDesc'),
      showWarning: true,
    },
    {
      field: 'scheduledStart',
      title: t('ScheduledStart'),
      description: t('ScheduledStartDesc'),
      showWarning: false,
      hidden: isRemote,
    },
    {
      field: 'scheduledRestart',
      title: t('ScheduledRestart'),
      description: isRemote
        ? t('ScheduledRestartRemoteDesc')
        : t('ScheduledRestartDesc'),
      showWarning: true,
    },
  ];

  return (
    <div className="mx-4 pt-6 w-full h-screen overflow-y-scroll">
      <div className="flex flex-col gap-6 pb-40 max-w-3xl">
        <Theme appearance="dark" style={{ background: 'inherit' }}>
          <Text color="gray" size="2">
            {t('ScheduleRequiresGuiOpen')}
          </Text>
          <Text color="gray" size="2">
            {t('ScheduleRequiresRestApi')}
          </Text>
        </Theme>

        {schedules
          .filter((schedule) => !schedule.hidden)
          .map((schedule) => {
            const value = normalizeDailySchedule(
              serverInfo[schedule.field] ?? DEFAULT_DAILY_SCHEDULE,
            );
            const { hour, minute } = parseTimeParts(value.time);

            return (
              <div
                key={schedule.field}
                className="rounded-lg border border-white/10 p-4 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <Text weight="bold">{schedule.title}</Text>
                    <Text color="gray" size="2">
                      {schedule.description}
                    </Text>
                  </div>
                  <Switch
                    checked={value.enabled}
                    onCheckedChange={(enabled) =>
                      updateSchedule(schedule.field, { enabled })
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Text size="2" color="gray">
                    {t('SetTime')}
                  </Text>
                  <Select.Root
                    size="2"
                    value={hour}
                    disabled={!value.enabled}
                    onValueChange={(nextHour) =>
                      updateSchedule(schedule.field, {
                        time: buildTime(nextHour, minute),
                      })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {HOUR_OPTIONS.map((option) => (
                        <Select.Item key={option} value={option}>
                          {option}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  <Text>:</Text>
                  <Select.Root
                    size="2"
                    value={minute}
                    disabled={!value.enabled}
                    onValueChange={(nextMinute) =>
                      updateSchedule(schedule.field, {
                        time: buildTime(hour, nextMinute),
                      })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {MINUTE_OPTIONS.map((option) => (
                        <Select.Item key={option} value={option}>
                          {option}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </div>

                {schedule.showWarning && (
                  <div className="flex items-center gap-3">
                    <Text size="2" color="gray">
                      {t('ScheduleWarningMinutes')}
                    </Text>
                    <TextField.Root
                      type="number"
                      min={1}
                      max={60}
                      disabled={!value.enabled}
                      value={String(value.warningMinutes ?? 5)}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        updateSchedule(schedule.field, {
                          warningMinutes: Number.isFinite(parsed)
                            ? Math.min(60, Math.max(1, parsed))
                            : 5,
                        });
                      }}
                      style={{ width: 80 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
