export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string;
}

export function renderPerson(person: Person): string {
  const { first_name, last_name, nickname } = person;
  return `${last_name.toUpperCase()}, ${first_name}${nickname ? ' (' + nickname + ')' : ''}`;
}