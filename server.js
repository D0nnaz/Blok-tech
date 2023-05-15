const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const { MongoClient } = require("mongodb");
const { MONGO_URI } = require("./.env");
const client = new MongoClient(MONGO_URI);
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;
const chats = require("./js/home.js");

app.use("/static", express.static("static"));
app.use("/js", express.static("js"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", function (req, res) {
  res.render("home", { chats: chats, title: "Homepage" });
});

app.get("/login", function (req, res) {
  res.render("login", { title: "login" });
});

app.get("/chat/:chatName/", (req, res) => {
  res.render("chat", {
    layout: false,
    messages: [],
  });
});

app.use(function (req, res) {
  res.status(404).render("404", { title: "404 Not Found :(" });
});

// server.js
async function run() {
  try {
    await client.connect();
    const database = client.db("chatlingo");
    const messagesCollection = database.collection("messages");
    console.log("MONGODB IS HIER YUH :)");

    io.on("connection", async (socket) => {
      const chatName = socket.handshake.headers.referer.split("/").pop();
      console.log(`User ${socket.id} connected in ${chatName}`);
      socket.join(chatName);

      socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected from ${chatName}`);
      });

      const chatHistory = await messagesCollection
        .find({ chatName })
        .toArray();
      socket.emit("chatHistory", chatHistory);

      socket.on("message", async (msg) => {
        msg.sender = socket.id;
        await messagesCollection.insertOne({ ...msg, chatName });
        io.to(chatName).emit("message", msg);
        console.log(`Message toegevoegd aan MongoDB: ${msg}`);
      });
    });
  } catch (err) {
    console.log(err);
  } finally {
    // await client.close();
  }
}
run();


http.listen(PORT, () => {
  console.log(`Server gestart on port ${PORT}`);
});
