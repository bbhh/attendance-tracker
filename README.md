# attendance-tracker

## Installation

1. Configure environment variables (tweak as desired):
    ```shell
   $ echo "DATABASE_URL=app.db
   SERVER_HOST=127.0.0.1
   SERVER_PORT=8080" > .env
    ```
2. Set up Diesel:
   ```shell
   $ cargo install diesel_cli
   $ diesel setup
   $ diesel migration run
   ```
3. Build:
   ```shell
   $ cargo build --release
   ```