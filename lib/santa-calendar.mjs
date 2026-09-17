const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function minutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function mergeCalendarBusyIntervals(date, bookings, busyPeriods) {
  const calendarBookings = busyPeriods.flatMap((period) => {
    if (!TIME_PATTERN.test(period?.startTime ?? "") || !TIME_PATTERN.test(period?.endTime ?? "")) return [];
    if (minutes(period.startTime) >= minutes(period.endTime)) return [];
    return [{
      date,
      startTime: period.startTime,
      endTime: period.endTime,
      status: "confirmed",
    }];
  });

  return [...bookings, ...calendarBookings];
}
