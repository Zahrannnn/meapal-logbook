import { useEffect, useState } from 'react';
import { format } from 'date-fns';

/** Personal Task Record celebration: beats once per day per record, so a refresh
 *  doesn't replay yesterday's confetti. */
export const useRecordCelebration = ({
  selectedDate,
  isNewRecord,
}: {
  selectedDate: Date;
  isNewRecord: boolean;
}) => {
  const [burstPlaying, setBurstPlaying] = useState(false);
  const celebrateKey = `logbook:record-celebrated:${format(selectedDate, 'yyyy-MM-dd')}`;

  useEffect(() => {
    if (!isNewRecord) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (localStorage.getItem(celebrateKey)) return;
      localStorage.setItem(celebrateKey, '1');
      setBurstPlaying(true);
      timer = setTimeout(() => setBurstPlaying(false), 2400);
    } catch {
      setBurstPlaying(true);
      timer = setTimeout(() => setBurstPlaying(false), 2400);
    }
    return () => timer && clearTimeout(timer);
  }, [isNewRecord, celebrateKey]);

  return burstPlaying;
};
