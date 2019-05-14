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

async function getDatabase(){
    if (Object.keys(database).length === 0 && database.constructor === Object) {
        await createDatabase();
    }

    return database;
}

async function saveCredentials(credentials){
    let db = await getDatabase();
    try{
        await db.credentials.insert(credentials);
    }catch(e){
        // error reporting
    }
}

async function saveProfile(profile){
    let db = await getDatabase();
    try{
        await db.profile.insert(profile);
    }catch(e){
        // error reporting
    }
}

async function getCredentials(){
    let db = await getDatabase();
    let credentials;

    try{
        credentials = await (db.credentials.findOne()).exec();
    }catch(e){
        credentials = null;
    }

    return credentials;
}

async function clearCredentials(){
    let db = await getDatabase();
    try{
        await db.credentials.find().remove();
        await db.profile.find().remove();
    }catch(e){
        // error reporting
    }
}

export {
    getDatabase,
    saveCredentials,
    saveProfile,
    getCredentials,
    clearCredentials
};