const MONTH_LOOKUP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const DISPLAY_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function parseHumanDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, '').trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const [dayLabel, monthLabel, yearLabel] = normalized.split(/\s+/);

  if (!dayLabel || !monthLabel || !yearLabel) {
    return null;
  }

  const monthIndex = MONTH_LOOKUP[monthLabel];
  const day = Number(dayLabel);
  const year = Number(yearLabel);

  if (monthIndex === undefined || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  const isoMonth = String(monthIndex + 1).padStart(2, '0');
  const isoDay = String(day).padStart(2, '0');
  return `${year}-${isoMonth}-${isoDay}`;
}

export function formatDisplayDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date
    ? value
    : new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return DISPLAY_FORMATTER.format(date);
}
