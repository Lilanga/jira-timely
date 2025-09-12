import { createRxDatabase, addRxPlugin } from "rxdb";
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
// import { QueryChangeDetector } from "rxdb";
import {
    credentialsSchema,
    profileSchema
} from "../data";
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

// Add the leader election plugin
addRxPlugin(RxDBLeaderElectionPlugin);

// QueryChangeDetector.enable();
// QueryChangeDetector.enableDebugging();
// RxDB v15+ uses modern storage adapters
// addRxPlugin(require("pouchdb-adapter-idb"));
const dbName = "timelydb";
let database = null;

async function createDatabase() {
    try {
        let db = await createRxDatabase({
            name: dbName,
            storage: getRxStorageDexie(),
            ignoreDuplicate: true, // Allow reusing existing database
        });

        console.log("Database created successfully:", db);

        db.waitForLeadership().then(() => {
            document.title = "♛ " + document.title;
        });

        await db.addCollections({
            credentials: {
                schema: credentialsSchema
            },
            profile: {
                schema: profileSchema
            }
        });

        console.log("Collections created successfully");
        database = db;
    } catch (error) {
        console.error("Database creation error:", error);
        // If database already exists, try to get the existing instance
        if (error.code === 'DB8' || error.message?.includes('already exists')) {
            // Database already exists, this is okay
            console.log("Database already exists, reusing existing instance");
            // Don't set database to an empty object, keep it as is for retry
        } else {
            throw error;
        }
    }
}

async function getDatabase(){
    if (!database) {
        await createDatabase();
    }

    console.log("Returning database:", database);
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

async function getProfile(){
    let db = await getDatabase();
    let profile;

    try{
        profile = await (db.profile.findOne()).exec();
    }catch(e){
        profile = null;
    }

    return profile;
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
    getProfile,
    clearCredentials
};