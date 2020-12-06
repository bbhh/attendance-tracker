table! {
    attendances (id) {
        id -> Integer,
        person_id -> Integer,
        date -> Text,
    }
}

table! {
    persons (id) {
        id -> Integer,
        first_name -> Text,
        last_name -> Text,
        nickname -> Text,
    }
}

joinable!(attendances -> persons (person_id));

allow_tables_to_appear_in_same_query!(
    attendances,
    persons,
);
