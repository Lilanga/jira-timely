import * as RxDB from "rxdb";
// import { QueryChangeDetector } from "rxdb";
import {
    credentialsSchema,
    profileSchema
} from "../data";

// QueryChangeDetector.enable();
// QueryChangeDetector.enableDebugging();
RxDB.plugin(require("pouchdb-adapter-idb"));
const dbName = "timelydb";
let database = {};

async function createDatabase() {
    if (Object.keys(database).length === 0 && database.constructor === Object) {
        let db = await RxDB.create({
            name: dbName,
            adapter: "idb",
            queryChangeDetection: true,
        });

        db.waitForLeadership().then(() => {
            document.title = "♛ " + document.title;
        });

        await db.collection({
            name: "credentials",
            schema: credentialsSchema
        });

        await db.collection({
            name: "profile",
            schema: profileSchema
        });

        database = db;
    }
    return database;
}

export {
    database,
    createDatabase
};