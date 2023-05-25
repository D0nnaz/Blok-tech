# Chatlingo
With ChatLingo, you can log in and join specific language-based chats, such as Spanish or Mandarin. Within these chats, you have the opportunity to engage in conversations with other users, fostering a collaborative environment for language learning. Whether it's asking questions, engaging in casual conversations, or providing assistance, ChatLingo allows you to interact with fellow language enthusiasts, creating an enjoyable and supportive space to improve your language skills.

# Preview app
Desktop:<br>
https://youtu.be/38kuqKCZ044

Phone:<br>
[https://youtube.com/shorts/rxlEhegzNto?feature=share](https://youtu.be/gas0k5bhd7A)


# How to install ChatLingo
> 1. git clone https://github.com/D0nnaz/Blok-tech.git

> 2. cd <The location where you've stored the project.> 

> 3. npm install

> 4. npm start

# How does the code work

### Here's a brief explanation of how the code functions:

> // Setting up the server:<br>
> const http = require("http").createServer(app);<br>
> const io = require("socket.io")(http);<br>
> const PORT = process.env.PORT || 3000;<br>

This code sets up the server by creating an HTTP server instance using the Express app object. It also initializes a Socket.IO instance that enables real-time communication. The server listens on the specified port, which can be set through the PORT environment variable.



> // Handling user login:<br>
> app.post("/login", async (req, res) => {<br>
>   // ...<br>
> });<br>

This code defines a route to handle user login. When a POST request is made to the "/login" endpoint, it executes the provided callback function. Within the function, you can implement the logic for validating user credentials, performing authentication checks against a MongoDB database, and establishing a user session if the login is successful.

> // Rendering the homepage:<br>
> app.get("/", checkSession, async function (req, res) {<br>
>   // ...<br>
> });<br>

This code defines a route to render the homepage. It uses the app.get() method to handle GET requests to the root ("/") path. The checkSession middleware ensures that the user is authenticated before accessing the homepage. Within the callback function, you can implement the logic to retrieve the user's information, such as their username, from the session and render the homepage with the available chatrooms.

> // Sending and receiving messages in a chatroom:<br>
> app.post("/chat/:chatName/message", checkSession, async (req, res) => {<br>
>   // ...<br>
> });<br>

This code handles the sending of messages in a specific chatroom. It defines a route with a dynamic parameter :chatName, representing the name of the chatroom. The route expects a POST request and utilizes the checkSession middleware to ensure the user is authenticated. Within the callback function, you can implement the logic to extract the sender, message content, and chatroom information from the request body. The message is then inserted into a MongoDB collection and emitted to all connected clients in the respective chatroom using Socket.IO.

> socket.on("message", async (msg) => {<br>
>   // ...<br>
> });<br>

This code listens for incoming messages from the server using Socket.IO on the client-side. It registers a callback function to handle the "message" event. When a new message is received, you can implement the logic to display the message in the chat interface.

> // Real-time message display:<br>
> socket.on("message", function (data) {<br>
>   // ...<br>
> });<br>

This code sets up the real-time message display functionality. It registers an event listener on the client-side Socket.IO instance to listen for the "message" event. When a new message event is received from the server, the specified callback function is executed. You can customize the logic inside the callback function to handle the received message data, such as displaying it in the chat interface or performing any other desired actions.

> // Displaying chat history:<br>
> socket.on("chatHistory", function (chatHistory) {<br>
>   // ...<br>
> });<br>

This code receives the chat history from the server using Socket.IO on the client-side. It listens for the "chatHistory" event and expects the chat history data as the payload. You can implement the logic to display the chat history in the chat interface based on the received data.

# More info?
Check the wiki:
[https://github.com/D0nnaz/blok-tech-wiki/wiki](https://github.com/D0nnaz/Blok-tech/wiki)
### Note: the wiki is in Dutch!


## License

<a href = "https://github.com/D0nnaz"> MIT © Donna Stam </a>
