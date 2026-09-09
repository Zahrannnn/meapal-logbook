import { useMemo } from 'react';
import { ActivityEntry, User } from '../../../entities';
import { getPayPeriod, getPeriodWorkdays, getElapsedWorkdays } from '../../../lib/payPeriod';

/** Pay-period progress (21st → 20th) for whichever period the selected date belongs to:
 *  the dashboard fetch loads exactly that period. */
export const usePayPeriodProgress = ({
  currentUser,
  activities,
  selectedDate,
  loadedPeriodKey,
}: {
  currentUser: User;
  activities: ActivityEntry[];
  selectedDate: Date;
  loadedPeriodKey?: string | null;
}) => {
  const payPeriod = useMemo(() => getPayPeriod(selectedDate), [selectedDate]);
  const periodKey = `${currentUser.id}:${payPeriod.startStr}`;
  const periodCovered = loadedPeriodKey === periodKey;
  const ownActivities = useMemo(
    () => activities.filter((activity) => !activity.employeeName || activity.employeeName === currentUser.name),
    [activities, currentUser.name],
  );
  const periodWorkdays = useMemo(() => getPeriodWorkdays(payPeriod), [payPeriod]);
  const elapsedWorkdays = useMemo(
    () => getElapsedWorkdays(periodWorkdays, payPeriod),
    [periodWorkdays, payPeriod],
  );

  return { payPeriod, periodCovered, ownActivities, periodWorkdays, elapsedWorkdays };
};
