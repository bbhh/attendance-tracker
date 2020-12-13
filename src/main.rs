#[macro_use]
extern crate actix_web;
#[macro_use]
extern crate log;
#[macro_use]
extern crate diesel;

use std::{env, io};

use actix_files as fs;
use actix_web::{
    middleware, App, HttpServer,
    web,
};
use actix_cors::Cors;
use diesel::SqliteConnection;
use diesel::r2d2::ConnectionManager;

mod handlers;
mod models;
mod actions;
mod schema;
mod responses;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

#[actix_rt::main]
async fn main() -> io::Result<()> {
    env::set_var("RUST_LOG", "actix_web=debug,actix_server=info,info");
    env_logger::init();
    dotenv::dotenv().ok();

    // read in environment variables
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    debug!("{}", database_url);
    let server_host = env::var("SERVER_HOST")
        .expect("SERVER_HOST must be set");
    let server_port = env::var("SERVER_PORT")
        .expect("SERVER_PORT must be set");

    // connect to database
    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create database connection pool");

    // run web server
    HttpServer::new(move || {
        let cors = Cors::permissive()
            .supports_credentials()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"]);

        App::new()
            // set up DB pool to be used with web::Data<Pool> extractor
            .data(pool.clone())

            // enable logger - always register actix-web Logger middleware last
            .wrap(middleware::Logger::default())

            .wrap(cors)

            .service(
                web::scope("/api")
                    .service(handlers::list_persons)
                    .service(handlers::add_person)
                    .service(handlers::get_person)
                    .service(handlers::update_person)
                    .service(handlers::delete_person)

                    .service(handlers::list_attendances)
                    .service(handlers::upsert_attendance)
            )

            .service(fs::Files::new("/", "static").index_file("index.html"))
    })
        .bind(format!("{}:{}", server_host, server_port))?
        .run()
        .await
}