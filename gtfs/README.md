## Why is this empty?

GTFS raw data is huge! For Wiener Linien it's around 500 MB unzipped.

 * Download the ZIP: https://go.gv.at/l9gtfs
 * Put the content of the GTFS-ZIP in this directory.
 * Run the validation script `validate-gtfs.js` to spot errors.
 * Import everything with `psql` and the `wienerlinien.sql` script.