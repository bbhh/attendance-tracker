// @generated automatically by Diesel CLI.

diesel::table! {
    attendances (id) {
        id -> Integer,
        person_id -> Integer,
        date -> Text,
    }
}

diesel::table! {
    persons (id) {
        id -> Integer,
        first_name -> Text,
        last_name -> Text,
        nickname -> Text,
    }
}

diesel::joinable!(attendances -> persons (person_id));

diesel::allow_tables_to_appear_in_same_query!(
    attendances,
    persons,
);
