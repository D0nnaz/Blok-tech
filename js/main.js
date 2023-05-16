// const database = client.db("chatlingo");
// const messagesDB = database.collection("messages");
// console.log("MONGODB IS HIER YUH :)");

// const messagesCollection = client.db().collection("messages");

// const messages = [];

// io.on("connection", async (socket) => {
//   console.log(`User ${socket.id} connected`);

//   messages.forEach((message) => {
//     socket.emit("message", message);
//   });

//   socket.on("disconnect", () => {
//     console.log(`User ${socket.id} disconnected`);
//   });

//   socket.on("message", async (msg) => {
//     msg.sender = socket.id;
//     await messagesCollection.insertOne(msg);
//     messages.push(msg);
//     io.emit("message", msg);
//     console.log(`Message toegevoegd aan MongoDB: ${msg}`);
//   });
// });
