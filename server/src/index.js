require('dotenv').config();

const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const cors       = require('cors');
const app        = require("express")();
const bodyParser = require("body-parser");
const http       = require('http').Server(app);
const io         = require('socket.io')(http);
//const app        = express();

const { addClientToMap, removeClientFromMap, parseMap } = require('./socket/socket-connections');
const { getRecentMessages, saveMessage, queryMessages } = require("./routes/queries/messages");
const { getTasksByTeam, saveTask, editTask, deleteTask } = require('./routes/queries/tasks');
const { getLoginData } = require('./routes/queries/loginData');
const { updateStatusAndGetTasks, submitTaskForReview, saveFeedback } = require('./routes/queries/submit-for-review');

const messageRoutes = require("./routes/messages");
const employeeRoutes = require("./routes/employees");
const submissionRoutes = require("./routes/submissions");
const taskRoutes = require("./routes/tasks");

// PG database client/connection setup
const { Client } = require('pg');
const dbParams = require('./lib/db');
const db = new Client(dbParams);

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

// test for getting login data 
app.get('/:id', (req, res) => {
  const userId = req.params.id
  getLoginData(db, userId, loginData => {
    res.json(loginData);
  });
});

io.on('connection', (socket) => {
  //on login
  socket.on('user logged in', userId => {
    console.log('logged in');
    getLoginData(db, userId, loginData => {
      socket.emit('login data', loginData);
    });
  });

  //tasks
  socket.on('tasks update', (taskItem, op) => {
    const CREATE = 'CREATE';
    const EDIT   = 'EDIT';
    const DELETE = 'DELETE';

    let taskOperation;
    switch (op) {
      case CREATE:
        taskOperation = saveTask(db, taskItem);
        break;
      case EDIT:
        taskOperation = editTask(db, taskItem.id, taskItem);
        break;
      case DELETE:
        taskOperation = deleteTask(db, taskItem.id);
        break;
      default:
        socket.emit('error', 'invalid operation: ' + op, taskItem);
        return;
    };
    taskOperation
      .then(data => {
        socket.emit('tasks action saved', op, data.rows[0])
        return getTasksByTeam(db, taskItem.projecttask_id);
      })
      .then(data => {
        io.emit('tasks update', data.rows, taskItem.employee_id);
      })
      .catch(err => socket.emit('error', `could not perform operation "${op}" ${err}` , taskItem));
  }) 

  socket.on('move task', (taskItem, IN_PROGRESS) => {
    updateStatusAndGetTasks(db, taskItem.id, IN_PROGRESS)
      .then(taskData => {
        socket.emit('tasks action saved', 'MOVE TO IN PROGRESS', taskItem);
        io.emit('tasks update', taskData.rows);
      })
      .catch(err => socket.emit('error', `could not perform operation: MOVE` + err, taskItem));
  })

  socket.on('employee submit', submitTaskData => {
    //save to db 
    submitTaskForReview(db, submitTaskData)
      .then(res => {
        socket.emit('tasks action saved', 'SUBMIT', submitTaskData);
        //emit to all clients
        io.emit('submt/feedback', res);
      })
      .catch(err => socket.emit('error', 'could not submit task: ' + err, submitTaskData));
  })

  socket.on('feedback', feedbackData => {
    saveFeedback(db, feedbackData)
      .then(res => {
        socket.emit('tasks action saved', 'FEEDBACK', feedbackData);
        io.emit('submt/feedback', res);
      })
      .catch(err => socket.emit('error', 'could not save feedback ' + err, feedbackData));
  })

  //chat
  socket.on('joining msg', (username, userId) => {
    addClientToMap(userId, socket.id);
    io.emit('user joined', parseMap(), username);
  });

  socket.on('leaving msg', (username, userId) => {
    removeClientFromMap(userId, socket.id);
    io.emit('user left', parseMap(), username)
  });

  socket.on('chat message', messageData => {
    io.emit('chat message', messageData);
    saveMessage(db, messageData)
      .then(data => socket.emit('message saved', data.rows[0]))
      .catch(err => socket.emit('error', 'could not save message to db: ' + err, messageData));
  });

  socket.on('get previous messages', (time_iso, numMsg) => {
    queryMessages(db, numMsg, time_iso)
      .then(data => {
        socket.emit('get previous messages', data.rows)

        // setTimeout(() => {
        //   socket.emit('get previous messages', data.rows)
        // }, 500);
      })
      .catch(err => socket.emit('error', 'could not get previous messages: ' + err, 'no data'))
  })

  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
});
