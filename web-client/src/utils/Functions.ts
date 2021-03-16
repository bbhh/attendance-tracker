import Constants from "./Constants";

export function formatShortDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' }).format(date);
}

export function formatIsoDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

// if today is Sunday, return today; otherwise, return previous Sunday
export function getCurrentSunday(): Date {
    const today = new Date();
    const sunday = new Date();
    sunday.setDate(today.getDate() - today.getDay());
    return sunday;
}

export function jumpDate(date: Date, delta: number) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + delta);
    return newDate;
}

export function jumpDateForward(date: Date) {
    return jumpDate(date, Constants.CALENDAR_JUMP_IN_DAYS);
}

export function jumpDateBackward(date: Date) {
    return jumpDate(date, -Constants.CALENDAR_JUMP_IN_DAYS);
}