require('dotenv').config();

const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const cors       = require('cors');
const app        = require("express")();
const bodyParser = require("body-parser");
const http       = require('http').Server(app);
const io         = require('socket.io')(http);
const bodyParser = require('body-parser');
//const app        = express();

const { saveMessage } = require("./routes/helpers/messages");
const messageRoutes = require("./routes/messages");
const employeeRoutes = require("./routes/employees");
const submissionRoutes = require("./routes/submissions");
const taskRoutes = require("./routes/tasks");

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db');
const db = new Pool(dbParams);

db.connect(err => {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
});

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static("public"));

app.use("/api", messageRoutes(db));
app.use("/api", employeeRoutes(db));
app.use("/api", submissionRoutes(db));

// Tasks route
app.use("/api", taskRoutes(db));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
  socket.on('joining msg', username => {
    console.log(username + " joined the chat.");
  });

  socket.on('leaving msg', username => {
    console.log(username + " left the chat.");
  })

  socket.on('chat message', messageData => {
    io.emit('chat message', messageData);
    saveMessage(db, messageData)
      .then(data => io.emit('message saved', data.rows[0]))
      .catch(err => io.emit('error', err));
  });

  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
});