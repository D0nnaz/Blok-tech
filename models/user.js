// Importeren van benodigde modules
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;

// Definitie van de User klasse
class User {
  constructor() {
    this.client = new MongoClient(MONGO_URI);
  }

  // Methode om inloggegevens te verifiëren
  async verifyCredentials(username, password) {
    try {
      await this.client.connect();
      const database = this.client.db("chatlingo");
      const usersCollection = database.collection("users");

      // Het opzoeken van de gebruiker in de database
      const user = await usersCollection.findOne({ username });

      // Controleren of de gebruiker bestaat en of het wachtwoord overeenkomt
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await this.client.close();
    }
  }

  // Methode om de chatgeschiedenis op te halen
  async getChatHistory(chatName) {
    try {
      await this.client.connect();
      const database = this.client.db("chatlingo");
      const messagesCollection = database.collection("messages");

      // Het ophalen van alle berichten met de opgegeven chatnaam
      const chatHistory = await messagesCollection.find({ chatName }).toArray();

      return chatHistory;
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      await this.client.close();
    }
  }

  // Methode om een gebruiker op te halen op basis van de gebruikersnaam
  async getUser(username) {
    try {
      await this.client.connect();
      const database = this.client.db("chatlingo");
      const usersCollection = database.collection("users");

      // Het opzoeken van de gebruiker in de database
      const user = await usersCollection.findOne({ username });

      return user;
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      await this.client.close();
    }
  }

  // Methode om een bericht toe te voegen aan de database
  async addMessage(chatName, messageContent, sender, timestamp) {
    try {
      await this.client.connect();
      const database = this.client.db("chatlingo");
      const messagesCollection = database.collection("messages");

      // Het toevoegen van het bericht aan de messages collectie
      await messagesCollection.insertOne({
        chatName,
        sender,
        content: messageContent,
        timestamp,
      });
    } catch (error) {
      console.log(error);
    } finally {
      await this.client.close();
    }
  }
}

module.exports = User;
