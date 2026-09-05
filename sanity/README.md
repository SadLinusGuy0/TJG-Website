These are executable Studio schemas owned by this repository. They import helpers from `sanity`, which is a development dependency and is not shipped in the public website bundle.

Run `npm run test:schemas` to import and compile all three schemas without network access, and `npm run typecheck:tooling` to check schemas and migration scripts. `npm run studio` starts the optional local Studio using the root `.env.local`. Studio project and dataset can be overridden with `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`. `npm run studio:validate` performs the CLI validation. Starting a Studio does not deploy it or change content.

The website reader accepts only `SANITY_READ_TOKEN` (read-only, or omitted for public data). The migration requires a separate `SANITY_MIGRATION_TOKEN` with write access and must be invoked deliberately; CI does not run migrations.
