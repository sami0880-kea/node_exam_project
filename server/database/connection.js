import { MongoClient } from "mongodb";

const URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster40543.niyaatn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster40543`;
const client = new MongoClient(URL);

const dbName = "leaseportal";

await client.connect();

const db = client.db(dbName);

export default {
    users: db.collection("users"),
    listings: db.collection("listings"),
    messages: db.collection("messages"),
    conversations: db.collection("conversations"),
};