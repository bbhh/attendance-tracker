use actix_web::{HttpResponse, web, Error};

use crate::models::{AddPersonRequest, ListAttendancesRequest, UpsertAttendanceRequest};
use crate::{DbPool, actions};
use crate::responses::ErrorResponse;
use chrono::NaiveDate;

/***********/
/* PERSONS */
/***********/

#[get("/persons")]
pub async fn list_persons(pool: web::Data<DbPool>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    let persons = web::block(move || actions::list_persons(&connection))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(persons))
}

#[post("/persons")]
pub async fn add_person(pool: web::Data<DbPool>, form: web::Json<AddPersonRequest>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    let first_name = form.first_name.trim().to_owned();
    let last_name = form.last_name.trim().to_owned();
    let nickname = form.nickname.trim().to_owned();

    if first_name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse::from("First name is required".to_owned())));
    }
    if last_name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse::from("Last name is required".to_owned())));
    }

    // TODO: ignore result
    let result = web::block(move || actions::add_person(&connection, &first_name, &last_name, &nickname))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(result))
}

#[get("/persons/{id}")]
pub async fn get_person(pool: web::Data<DbPool>, id_: web::Path<i32>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    let person = web::block(move || actions::get_person(&connection, id_.into_inner()))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(person))
}

#[put("/persons/{id}")]
pub async fn update_person(pool: web::Data<DbPool>, id_: web::Path<i32>, form: web::Json<AddPersonRequest>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    let first_name = form.first_name.trim().to_owned();
    let last_name = form.last_name.trim().to_owned();
    let nickname = form.nickname.trim().to_owned();

    if first_name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse::from("First name is required".to_owned())));
    }
    if last_name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse::from("Last name is required".to_owned())));
    }

    // TODO: ignore result
    let result = web::block(move || actions::update_person(&connection, id_.into_inner(), &first_name, &last_name, &nickname))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(result))
}

#[delete("/persons/{id}")]
pub async fn delete_person(pool: web::Data<DbPool>, id_: web::Path<i32>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    // TODO: ignore result
    let result = web::block(move || actions::delete_person(&connection, id_.into_inner()))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(result))
}

/***************/
/* ATTENDANCES */
/***************/

#[get("/attendances")]
pub async fn list_attendances(pool: web::Data<DbPool>, query: web::Query<ListAttendancesRequest>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    // validate date
    let date = query.date.clone();
    if date.is_some() && validate_date(date.unwrap()) {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse::from("Date must be of the form YYYY-MM-DD".to_owned())));
    }

    let attendances = web::block(move || actions::list_attendances(&connection, query.date.clone(), query.person_id))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(attendances))
}

#[put("/attendances/{date}/{person_id}")]
pub async fn upsert_attendance(pool: web::Data<DbPool>, web::Path((date, person_id)): web::Path<(String, i32)>, form: web::Json<UpsertAttendanceRequest>) -> Result<HttpResponse, Error> {
    let connection = pool.get().expect("Failed to get database connection from pool");

    // validate date
    if validate_date(date.clone()) {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse::from("Date must be of the form YYYY-MM-DD".to_owned())));
    }

    let present = form.present.to_owned();

    // TODO: ignore result
    let result = web::block(move || actions::upsert_attendance(&connection, date.as_str(), person_id, present))
        .await
        .map_err(|e| {
            eprintln!("{}", e);
            HttpResponse::InternalServerError().finish()
        })?;

    Ok(HttpResponse::Ok().json(result))
}

fn validate_date(date: String) -> bool {
    return NaiveDate::parse_from_str(date.as_str(), "%Y-%m-%d").is_err()
}