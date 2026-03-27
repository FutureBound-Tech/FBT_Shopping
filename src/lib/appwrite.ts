import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("69c644c70030afa88e1f");

// Initializing the Appwrite services
const account = new Account(client);
const databases = new Databases(client);

// Ping the Appwrite backend server to verify the setup
// This will run when the client is initialized for the first time
client.ping().then((response) => {
    console.log("[APPWRITE] Ping response:", response);
}).catch((error) => {
    console.warn("[APPWRITE] Ping failed:", error);
});

export { client, account, databases };
