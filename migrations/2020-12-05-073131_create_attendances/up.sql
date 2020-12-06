CREATE TABLE attendances (
  id INTEGER NOT NULL PRIMARY KEY,
  person_id INTEGER NOT NULL,
  date VARCHAR NOT NULL,
  FOREIGN KEY(person_id) REFERENCES persons(id)
);
