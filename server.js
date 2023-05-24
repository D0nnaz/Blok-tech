require("dotenv").config();

const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const { MongoClient } = require("mongodb");

const { MONGO_URI, API_KEY } = process.env;

const client = new MongoClient(MONGO_URI);
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;
const chats = require("./public/js/home");
const database = client.db("chatlingo");
const messagesCollection = database.collection("messages");
const bcrypt = require("bcrypt");
const xss = require("xss");

console.log(`API Key: ${API_KEY}`);

const os = require("os");
const interfaces = os.networkInterfaces();
const addresses = [];

Object.keys(interfaces).forEach((interfaceName) => {
  interfaces[interfaceName].forEach((interfaceInfo) => {
    if (interfaceInfo.family === "IPv4" && !interfaceInfo.internal) {
      addresses.push(interfaceInfo.address);
    }
  });
});

console.log(`Server IP address: ${addresses[0]}`);

const session = require("express-session");
const cookieParser = require("cookie-parser");
const MemoryStore = require("memorystore")(session);
const checkSession = (req, res, next) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  next();
};

app.use("/static", express.static("static"));
app.use(express.static("public"));
app.use("/js", express.static("public/js"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const sessionMiddleware = session({
  secret: "geheim-woord",
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore(),
  cookie: { secure: false },
});

app.use(sessionMiddleware);

app.get("/login", function (req, res) {
  res.render("login", { title: "login", bodyClass: "inlogbody" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  await client.connect();
  const database = client.db("chatlingo");
  const usersCollection = database.collection("users");

  const user = await usersCollection.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Invalid username or password
    return res.render("login", {
      error: "Invalid username or password.",
      bodyClass: "error-body",
    });
  }

  req.session.username = username;

  const loggedInUrl = "/";
  return res.redirect(loggedInUrl);
});

app.get("/", checkSession, async function (req, res) {
  const username = req.session.username || "";
  console.log("Huidige gebruikersnaam:", username);

  const updatedChats = await Promise.all(
    chats.map(async (chat) => {
      const unreadMessageCount = await getUnreadMessageCount(
        chat.chatName,
        username
      );
      return { ...chat, newMessageCount: unreadMessageCount };
    })
  );

  res.render("home", {
    username: username,
    chats: updatedChats,
    title: "Homepage",
  });
});

app.get("/chat/:chatName", checkSession, async (req, res) => {
  const username = req.session.username || "";
  const chatName = req.params.chatName;
  const chat = chats.find((c) => c.chatName === chatName);

  await messagesCollection.updateMany(
    { chatName, sender: { $ne: username }, read: false },
    { $set: { read: true } }
  );

  const updatedChats = chats.map((chat) => {
    if (chat.chatName === chatName) {
      return { ...chat, newMessageCount: 0 };
    } else {
      return chat;
    }
  });

  res.render("chat", {
    layout: false,
    messages: [],
    username: username,
    chatName: chatName,
    chats: updatedChats,
    profilePicture: chat.profilePicture,
  });
});

app.post("/chat/:chatName/message", checkSession, async (req, res) => {
  const chatName = req.params.chatName;
  const sender = req.session.username;
  const messageContent = xss(req.body.message);

  await messagesCollection.insertOne({
    chatName,
    sender,
    content: messageContent,
    read: false,
  });

  io.to(chatName).emit("message", {
    chatName,
    sender,
    content: messageContent,
  });

  res.redirect(`/chat/${chatName}`);
});

app.use(function (req, res) {
  res.status(404).render("404", { title: "404 Not Found :(" });
});

async function getUnreadMessageCount(chatName, loggedInUser) {
  const unreadMessages = await messagesCollection.countDocuments({
    chatName,
    sender: { $ne: loggedInUser },
    read: false,
  });
  return unreadMessages;
}

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
        await messagesCollection.insertOne({
          ...msg,
          chatName,
          sender,
          timestamp,
          read: false,
        });
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
