#!/usr/bin/env node

// usage: ./validate-gtfs.js gtfsDir wienerlinien.sql
// => gtfsDir = the directory with the unzipped GTFS data
// => wienerlinien.sql = the create statements for the database

const fs = require("fs");
const path = require("path");
const {readdir} = fs.promises;
const readline = require("readline");
const assert = require("assert");

async function getHeader(path) {
    const stream = fs.createReadStream(path, "utf8");
    const reader = readline.createInterface({ input: stream });
    const line = await new Promise((resolve) => {
        reader.on("line", (line) => {
            reader.close();
            resolve(line);
        });
    });
    stream.close();

    // strip the BOM
    if (line.charCodeAt(0) === 0xFEFF) {
        return line.slice(1);
    }

    return line;
}

async function getHeaders(dir) {
    const fileNames = (await readdir(dir))
        .filter(name => name[0] !== "." && name !== "README.md")
        .sort();
    assert.deepStrictEqual(fileNames, [
        "agency.txt",
        "calendar.txt",
        "calendar_dates.txt",
        "routes.txt",
        "shapes.txt",
        "stop_times.txt",
        "stops.txt",
        "trips.txt",
    ]);

    const headers = {};
    for (const fileName of fileNames) {
        const fileHeader = await getHeader(path.join(dir, fileName));
        headers[fileName.replace(/\.txt$/, "")] = fileHeader.split(",");
    }

    return headers;
}

function getTables(sqlFile) {
    const tableDDL = fs.readFileSync(sqlFile, "utf8")
        .split("\n")
        .map(line => line.trim().replace(/^(DROP|\\copy) .*/im, "").replace(/ +/g, " "))
        .filter(line => line !== "" && line !== "(" && line !== ")" && line !== ");");
    
    const tables = {};
    let currentTable = null;
    for (const line of tableDDL) {
        const matchCreate = line.match(/^CREATE TABLE (.+)/);
        if(matchCreate !== null) {
            if (matchCreate.length !== 2) {
                throw new Error(`Invalid table DDL '${line}'`);
            }
            currentTable = matchCreate[1];
            tables[currentTable] = [];
        } else {
            if (currentTable === null) {
                throw new Error(`Invalid table DDL '${line}', current table is null!`);
            }

            const matchColumn = line.match(/^([a-z_]+) .+,?$/);
            if (matchColumn === null || matchColumn.length !== 2) {
                throw new Error(`Invalid table DDL '${line}'`);
            }

            tables[currentTable].push(matchColumn[1]);
        }
    }

    return tables;
}

(async () => {
    try {
        const gtfsFolder = process.argv[2] || "./gtfs";
        const sqlFile = process.argv[3] || "./wienerlinien.sql";

        const headers = await getHeaders(gtfsFolder);
        const tables = getTables(sqlFile);

        assert.deepStrictEqual(headers, tables);
        console.log("✅");
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    }
})();