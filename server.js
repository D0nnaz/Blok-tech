// server.js
// Importeren van benodigde modules
require("dotenv").config();
const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const { MongoClient } = require("mongodb");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MemoryStore = require("memorystore")(session);
const router = require("./controller/router.js");

// Port waarop de server draait
const PORT = process.env.PORT || 3000;

const { MONGO_URI, API_KEY } = process.env;
const client = new MongoClient(MONGO_URI);
const database = client.db("chatlingo");
const messagesCollection = database.collection("messages");

// Statische bestanden
app.use("/static", express.static("static"));
app.use(express.static("public"));
app.use("/js", express.static("public/js"));

// Handlebars als template-engine instellen
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Route voor het verkrijgen van de API-sleutel
app.get("/api/api-key", (req, res) => {
  res.json({ apiKey: API_KEY });
});

// Middleware voor het verwerken van URL-gecodeerde gegevens en cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sessiemiddleware instellen
const sessionMiddleware = session({
  secret: "sgdvFT37QV178E2BIFUDQIWNF87F2H398FINOd",
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
  cookie: { secure: false },
});
app.use(sessionMiddleware);
app.use(router);

// Functie om de server uit te voeren
async function run() {
  const client = new MongoClient(MONGO_URI);

  try {
    // Verbinding maken met de MongoDB-database
    await client.connect();

    console.log("MONGODB IS HIER YUH :)");

    // Middleware voor het instellen van sessie op socket.io-verbinding
    io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    // Event handler voor nieuwe socket.io-verbindingen
    io.on("connection", async (socket) => {
      // Naam van de chat ophalen uit de referer header
      const chatName = socket.handshake.headers.referer.split("/").pop();
      console.log(
        `User ${socket.request.session.username} connected in ${chatName}`
      );
      socket.join(chatName);

      // Controleren of de gebruiker is ingelogd
      if (socket.request.session && socket.request.session.username) {
        const loggedInUser = socket.request.session.username;
        console.log(`User ${loggedInUser} is ingelogd`);
        io.to(socket.id).emit("loggedInUser", loggedInUser);
      } else {
        console.log("Er is niet ingelogd");
      }

      // Event handler voor het verbreken van de verbinding
      socket.on("disconnect", () => {
        console.log(
          `User ${socket.request.session.username} disconnected from ${chatName}`
        );
      });

      // Chatgeschiedenis ophalen en naar de client sturen
      const chatHistory = await messagesCollection.find({ chatName }).toArray();
      socket.emit("chatHistory", chatHistory);

      // Nieuw bericht ontvangen van de client
      socket.on("message", async (msg) => {
        const sender = socket.request.session.username;
        const timestamp = Date.now();
        await messagesCollection.insertOne({
          ...msg,
          chatName,
          sender,
          timestamp,
          read: false,
        });

        // Bericht verzenden naar alle gebruikers in de chat via Socket.IO
        io.to(chatName).emit("message", { ...msg, sender, timestamp });
        console.log(`Message toegevoegd aan MongoDB: ${msg.content}`);
      });
    });
  } catch (err) {
    console.log(err);
  } finally {
    // await client.close();
  }
}

// Server starten en luisteren naar inkomende verzoeken
run();
http.listen(PORT, () => {
  console.log(`Server gestart op poort ${PORT}`);
});

// https://socket.io/docs/v4/
//https://hackernoon.com/build-a-chat-room-with-socketio-and-express
//chatGPT
//Sample code MongoDB
