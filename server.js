//server.js
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
const database = client.db("chatlingo");
const messagesCollection = database.collection("messages");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const MemoryStore = require("memorystore")(session); //https://www.npmjs.com/package/memorystore

app.use("/static", express.static("static"));
app.use("/js", express.static("js"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionMiddleware = session({ //https://medium.com/@alysachan830/cookie-and-session-ii-how-session-works-in-express-session-7e08d102deb8
  secret: "geheim-woord",
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
  cookie: { secure: false },
});

app.use(sessionMiddleware);

const checkSession = (req, res, next) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  next();
};

app.get("/login", function (req, res) {
  res.render("login", { title: "login" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  await client.connect();
  const database = client.db("chatlingo");
  const usersCollection = database.collection("users");

  const user = await usersCollection.findOne({ username });

  if (!user || user.password !== password) {
    return res.status(401).send("Ongeldige gebruikersnaam of wachtwoord.");
  }

  req.session.username = username;

  const loggedInUrl = "/";
  return res.redirect(loggedInUrl);
});

app.get("/", checkSession, function (req, res) {  
  const username = req.session.username || "";
  console.log("Huidige gebruikersnaam:", username);
  res.render("home", { username: username, chats: chats, title: "Homepage" });
});

app.get("/chat/:chatName", checkSession, (req, res) => {
  const username = req.session.username || "";
  const chatName = req.params.chatName;
  res.render("chat", {
    layout: false,
    messages: [],
    username: username,
    chatName: chatName,
  });
});

app.post("/chat/:chatName/message", checkSession, async (req, res) => {
  const chatName = req.params.chatName;
  const sender = req.session.username;
  const messageContent = req.body.message;

  await messagesCollection.insertOne({ chatName, sender, content: messageContent });

  io.to(chatName).emit("message", { chatName, sender, content: messageContent });

  res.redirect(`/chat/${chatName}`);
});


async function run() {
  try {
    await client.connect();

    console.log("MONGODB IS HIER YUH :)");

    io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    io.on("connection", async (socket) => {
      const chatName = socket.handshake.headers.referer.split("/").pop();
      console.log(
        `User ${socket.request.session.username} connected in ${chatName}`
      );
      socket.join(chatName);

      if (socket.request.session && socket.request.session.username) {
        const loggedInUser = socket.request.session.username;
        console.log(`User ${loggedInUser} is ingelogd`);
        io.to(socket.id).emit("loggedInUser", loggedInUser);
      } else {
        console.log("Er is niet ingelogd");
      }

      socket.on("disconnect", () => {
        console.log(
          `User ${socket.request.session.username} disconnected from ${chatName}`
        );
      });

      const chatHistory = await messagesCollection.find({ chatName }).toArray();
      socket.emit("chatHistory", chatHistory);

      socket.on("message", async (msg) => {
        const sender = socket.request.session.username;
        const timestamp = Date.now(); 
        await messagesCollection.insertOne({ ...msg, chatName, sender, timestamp });
        io.to(chatName).emit("message", { ...msg, sender, timestamp });
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
  console.log(`Server gestart op poort ${PORT}`);
});
