const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);

// Functie om de MongoDB-collectie voor berichten op te halen
async function getMessagesCollection() {
  try {
    await client.connect();
    const database = client.db("chatlingo");
    const messagesCollection = database.collection("messages");
    return messagesCollection;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = { getMessagesCollection };

//Deels van de sample code van MongoDB
