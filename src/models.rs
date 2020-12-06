use serde::{Deserialize, Serialize};
use super::schema::{persons, attendances};

#[derive(Debug, Clone, Serialize, Queryable)]
pub struct Person {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub nickname: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name="persons"]
pub struct NewPerson {
    pub first_name: String,
    pub last_name: String,
    pub nickname: String,
}

#[derive(Deserialize)]
pub struct AddPersonRequest {
    pub first_name: String,
    pub last_name: String,
    pub nickname: String,
}

#[derive(Deserialize)]
pub struct ListAttendancesRequest {
    pub date: Option<String>,
    pub person_id: Option<i32>,
}

#[derive(Deserialize)]
pub struct UpsertAttendanceRequest {
    pub present: bool,
}

#[derive(Debug, Clone, Serialize, Queryable)]
pub struct Attendance {
    pub id: i32,
    pub person_id: i32,
    pub date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name="attendances"]
pub struct NewAttendance {
    pub person_id: i32,
    pub date: String,
}