# wienerlinien-gtfs2postgres

Import script to put Wiener Linien GTFS data into a PostgreSQL database.
Based on [tyleragreen/gtfs-schema](https://github.com/tyleragreen/gtfs-schema).

## Step by Step Guide

1. Download the ZIP: https://go.gv.at/l9gtfs (~ 40 MB)
1. Move all files of the GTFS-ZIP (~ 500 MB) in the `./gtfs` directory.
1. Run the validation script `validate-gtfs.js` to spot errors.
1. Import everything with `psql` and the `wienerlinien.sql` script.

### psql help

**Be careful!** The `wienerlinien.sql` will drop existing tables. If you
need historical data points, backup the database first
or rename existing tables. 

```
psql --host=localhost --port=5432 --username=USERNAME --password=SECRET --dbname=SOME_DATABASE --file=wienerlinien.sql 
```

## License

MIT – Philipp Naderer-Puiu