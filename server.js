
const Pusher = require('pusher');
require('dotenv').config()

const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const bodyParser = require('body-parser');
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());
server.use(middlewares);

const pusher = new Pusher({
  appId: process.env.REACT_APP_PUSHER_ID,
  key: process.env.REACT_APP_PUSHER_KEY,
  secret: process.env.REACT_APP_PUSHER_SECRET,
  cluster: process.env.REACT_APP_PUSHER_CLUSTER
});
// Custom middleware to access POST methids.
// Can be customized for other HTTP method as well.
server.use((req, res, next) => {
  
  if (req.method === "POST" && req.path.includes('/messages')) {
    // If the method is a POST echo back the name from request body
    const payload = req.body;
    pusher.trigger('chat', 'message', payload);
    pusher.trigger('chat', 'notify', payload);
    // res.json(payload);
    next();
  }
  else if (req.method === "PATCH" && req.path.includes('/messages')) {
    // If the method is a POST echo back the name from request body
    const payload = req.body;
    pusher.trigger('chat', 'notify', payload);
    // res.json(payload);
    next();
  }
  else if (["POST","PATCH"].includes(req.method) && req.path.includes('/users')) {
    // If the method is a POST echo back the name from request body
    const payload = req.body;
    pusher.trigger('chat', 'user', payload);
    next();
  }
  else if (["POST"].includes(req.method) && req.path.includes('/events')) {
    // If the method is a POST echo back the name from request body
    const payload = req.body;
    pusher.trigger('chat', 'isTyping', payload);
    res.json(payload);
    // next();
  }
  else
    next();
});

server.use(router);

server.listen( process.env.PORT || 5000, () => {
  console.log("JSON Server is running");
});
