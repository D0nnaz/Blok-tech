const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/user");
const { checkSession } = require("../middlewares/authMiddleware");
const { getMessagesCollection } = require("../models/database");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const xss = require("xss");
const chats = require("../public/js/home.js");

const user = new User();

// Functie om het aantal ongelezen berichten voor een gegeven gebruiker op te halen
async function getUnreadMessageCount(username) {
  try {
    const messagesCollection = await getMessagesCollection();

    if (!messagesCollection) {
      return 0;
    }

    const unreadMessages = await messagesCollection.countDocuments({
      receiver: username,
      read: false,
    });

    return unreadMessages;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

// Login-route - rendert de inlogpagina
router.get("/login", function (req, res) {
  res.render("login", { title: "login", bodyClass: "inlogbody" });
});

// Login-route - verwerkt het formulier en authenticatie
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const isAuthenticated = await user.verifyCredentials(username, password);

  if (!isAuthenticated) {
    return res.render("login", {
      error: "Ongeldige gebruikersnaam of wachtwoord.",
      bodyClass: "error-body",
    });
  }

  req.session.username = username;

  const loggedInUrl = "/";
  return res.redirect(loggedInUrl);
});

// Homepage-route - rendert de homepagina met bijgewerkte chatinformatie
router.get("/", checkSession, async function (req, res) {
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

// Chat-route - rendert de chatpagina voor een specifieke chat
router.get("/chat/:chatName", checkSession, async (req, res) => {
  const username = req.session.username || "";
  const chatName = req.params.chatName;
  const chat = chats.find((c) => c.chatName === chatName);

  const messagesCollection = await getMessagesCollection();

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
    profilePicture: chat ? chat.profilePicture : "",
  });
});

// Message-route - verwerkt het verzenden van een bericht in een chat
router.post("/chat/:chatName/message", checkSession, async (req, res) => {
  const chatName = req.params.chatName;
  const sender = req.session.username;
  const messageContent = xss(req.body.message);

  const messagesCollection = await getMessagesCollection();

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

// 404-pagina weergeven voor onbekende routes
router.use(function (req, res) {
  res.status(404).render("404", { title: "404 Niet gevonden :(" });
});

module.exports = router;

// https://socket.io/docs/v4/
// https://codeshack.io/basic-login-system-nodejs-express-mysql/
// chatGPT
