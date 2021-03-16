import { Person } from "./Person";

export interface PersonWithHistory {
    person: Person;
    attendances: string[];
}

export function renderPersonWithHistory(personWithHistory: PersonWithHistory): string {
    const { person: { first_name, last_name, nickname } } = personWithHistory;
    return `${last_name.toUpperCase()}, ${first_name}${nickname ? ' (' + nickname + ')' : ''}`;
}