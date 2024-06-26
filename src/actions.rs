use diesel::prelude::*;
use diesel::{SqliteConnection, RunQueryDsl};

use crate::models::{Person, NewPerson, Attendance, NewAttendance, AttendanceHistory};
use std::collections::HashMap;
use std::collections::hash_map::Entry;
use chrono::{Duration, NaiveDate, Utc};

/***********/
/* PERSONS */
/***********/

pub fn list_persons(connection: &SqliteConnection) -> Result<Vec<Person>, diesel::result::Error> {
    use crate::schema::persons::dsl::*;

    let results = persons
        .order_by(last_name.asc())
        .then_order_by(first_name.asc())
        .then_order_by(nickname.asc())
        .load::<Person>(connection)?;

    Ok(results)
}

pub fn add_person(connection: &SqliteConnection, first_name_: &str, last_name_: &str, nickname_: &str) -> Result<usize, diesel::result::Error> {
    use crate::schema::persons;

    let new_person = NewPerson {
        first_name: first_name_.to_owned(),
        last_name: last_name_.to_owned(),
        nickname: nickname_.to_owned(),
    };
    info!("Adding person {:?}...", new_person);

    // TODO: decide how to handle result
    let result = diesel::insert_into(persons::table)
        .values(&new_person)
        .execute(connection)?;

    Ok(result)
}

pub fn get_person(connection: &SqliteConnection, id_: i32) -> Result<Option<Person>, diesel::result::Error> {
    use crate::schema::persons::dsl::*;

    let person = persons
        .filter(id.eq(id_))
        .first::<Person>(connection)
        .optional()?;

    Ok(person)
}

pub fn update_person(connection: &SqliteConnection, id_: i32, first_name_: &str, last_name_: &str, nickname_: &str) -> Result<usize, diesel::result::Error> {
    use crate::schema::persons::dsl::*;

    let updated_person = NewPerson {
        first_name: first_name_.to_owned(),
        last_name: last_name_.to_owned(),
        nickname: nickname_.to_owned(),
    };
    info!("Updating person {} to {:?}...", id_, updated_person);

    // TODO: decide how to handle result
    let result = diesel::update(persons.filter(id.eq(id_)))
        .set(&updated_person)
        .execute(connection)?;

    return Ok(result)
}

pub fn delete_person(connection: &SqliteConnection, id_: i32) -> Result<usize, diesel::result::Error> {
    use crate::schema::persons::dsl::*;

    info!("Deleting person {}...", id_);

    let num_deleted = diesel::delete(persons.filter(id.eq(id_)))
        .execute(connection)?;

    // TODO: return error if none deleted
    Ok(num_deleted)
}

pub fn list_persons_with_history(connection: &SqliteConnection) -> Result<Vec<AttendanceHistory>, diesel::result::Error> {
    use crate::schema::persons::dsl::*;
    use crate::schema::attendances::dsl::*;

    let person_results: Vec<Person> = persons
        .order_by(last_name.asc())
        .then_order_by(first_name.asc())
        .then_order_by(nickname.asc())
        .load::<Person>(connection)?;

    let now = Utc::now();
    let start_date = now - Duration::days(365);
    let start_date_naive = start_date.naive_utc();
    let date_format = "%Y-%m-%d";

    let mut attendance_histories = HashMap::new();
    let attendance_results = attendances.load::<Attendance>(connection)?;
    for attendance in attendance_results {
        let attendance_date_naive_result = NaiveDate::parse_from_str(&attendance.date, date_format);
        if let Ok(attendance_date_naive) = attendance_date_naive_result {
            if start_date_naive > attendance_date_naive.into() {
                continue;
            }

            match attendance_histories.entry(attendance.person_id) {
                Entry::Vacant(e) => { e.insert(vec![attendance.date]); },
                Entry::Occupied(mut e) => { e.get_mut().push(attendance.date); }
            }
        }
    }

    let mut results = Vec::new();
    for person in person_results {
        results.push(AttendanceHistory {
            person: person.clone(),
            attendances: attendance_histories.get(&person.id).unwrap_or(Vec::new().as_ref()).clone()
        });
    }

    Ok(results)
}

/***************/
/* ATTENDANCES */
/***************/

pub fn list_attendances(connection: &SqliteConnection, date_: Option<String>, person_id_: Option<i32>) -> Result<Vec<Attendance>, diesel::result::Error> {
    use crate::schema::attendances::dsl::*;

    let mut query = attendances.into_boxed();
    if date_.is_some() {
        query = query.filter(date.eq(date_.unwrap()));
    }
    if person_id_.is_some() {
        query = query.filter(person_id.eq(person_id_.unwrap()));
    }
    let results = query.load::<Attendance>(connection)?;

    Ok(results)
}

pub fn upsert_attendance(connection: &SqliteConnection, date_: &str, person_id_: i32, present: bool) -> Result<usize, diesel::result::Error> {
    use crate::schema::attendances;

    if present {
        // insert
        let new_attendance = NewAttendance {
            person_id: person_id_,
            date: date_.to_owned(),
        };
        info!("Adding attendance {:?}...", new_attendance);

        // TODO: decide how to handle result
        let result = diesel::insert_into(attendances::table)
            .values(&new_attendance)
            .execute(connection)?;
        Ok(result)
    } else {
        use crate::schema::attendances::dsl::*;

        info!("Deleting attendance for {} on {}...", person_id_, date_);

        let num_deleted = diesel::delete(
            attendances
                .filter(date.eq(date_))
                .filter(person_id.eq(person_id_))
        )
            .execute(connection)?;

        // TODO: return error if none deleted
        Ok(num_deleted)
    }
}
