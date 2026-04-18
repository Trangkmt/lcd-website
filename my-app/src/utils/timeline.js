function getCurrentMonthAndYear(referenceDate = new Date()) {
    return {
        currentMonth: referenceDate.getMonth() + 1,
        currentYear: referenceDate.getFullYear(),
    };
}

export function toMonthNumber(value) {
    if (typeof value === 'string') {
        const monthMatch = value.match(/^\d{4}-(\d{2})$/);
        if (monthMatch) {
            const monthFromDate = Number.parseInt(monthMatch[1], 10);
            return monthFromDate >= 1 && monthFromDate <= 12 ? monthFromDate : null;
        }
    }

    const month = Number.parseInt(value, 10);
    if (!Number.isFinite(month) || month < 1 || month > 12) {
        return null;
    }

    return month;
}

export function toMonthInputValue(month, year = new Date().getFullYear()) {
    const monthNumber = toMonthNumber(month);
    if (!monthNumber) {
        return '';
    }

    return `${year}-${String(monthNumber).padStart(2, '0')}`;
}

export function parseMonthInputValue(value) {
    if (typeof value !== 'string' || !value) {
        return { year: null, month: null };
    }

    const match = value.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
        return { year: null, month: null };
    }

    return {
        year: Number.parseInt(match[1], 10),
        month: Number.parseInt(match[2], 10),
    };
}

export function resolveTimelineYear(month, referenceDate = new Date()) {
    const monthNumber = toMonthNumber(month);
    if (!monthNumber) {
        return null;
    }

    const { currentMonth, currentYear } = getCurrentMonthAndYear(referenceDate);
    return monthNumber < currentMonth ? currentYear + 1 : currentYear;
}

export function getTimelineYear(event, referenceDate = new Date()) {
    return event?.year || resolveTimelineYear(event?.month, referenceDate);
}

export function sortTimelineEvents(events, referenceDate = new Date()) {
    return [...events].sort((a, b) => {
        const yearA = getTimelineYear(a, referenceDate) || Number.MAX_SAFE_INTEGER;
        const yearB = getTimelineYear(b, referenceDate) || Number.MAX_SAFE_INTEGER;

        if (yearA !== yearB) {
            return yearA - yearB;
        }

        const monthA = toMonthNumber(a?.month) || 13;
        const monthB = toMonthNumber(b?.month) || 13;

        if (monthA !== monthB) {
            return monthA - monthB;
        }

        return Number(a?.id || 0) - Number(b?.id || 0);
    });
}

export function pickActiveTimelineEvent(events, currentMonth, referenceDate = new Date()) {
    if (!events.length) {
        return null;
    }

    const { currentYear } = getCurrentMonthAndYear(referenceDate);

    const inCurrentMonth = events.find((event) => {
        const month = toMonthNumber(event.month);
        const year = Number(getTimelineYear(event, referenceDate));
        return month === currentMonth && year === currentYear;
    });
    if (inCurrentMonth) {
        return inCurrentMonth;
    }

    const upcoming = events.find((event) => {
        const month = toMonthNumber(event.month);
        const year = Number(getTimelineYear(event, referenceDate));
        return (Number.isFinite(year) && year > currentYear) || (year === currentYear && month && month > currentMonth);
    });
    if (upcoming) {
        return upcoming;
    }

    return events[0];
}
