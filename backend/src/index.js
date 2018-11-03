// Server entrypoint:

// make sure that process env variables is available:
require('dotenv').config({ path: 'variables.env' });

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const db = require('./db');
const createServer = require('./createServer');

const server = createServer();

// Use express middlewre to handle cookies and extract JWT:
server.express.use(cookieParser());

// Decode jwt, extract user id and save it to request object:
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next();

  const { userId } = jwt.verify(token, process.env.APP_SECRET);
  req.userId = userId;
  next();
});

// Use express middleware to populate current user:
server.express.use(async (req, res, next) => {
  if (!req.userId) return next();

  const user = await db.query.user({
    where: { id: req.userId },
  }, '{ id, permissions, email, name }');

  if (!user) return next();

  req.user = user;
  next();
});

// Start the server:
server.start({
  // make sure that only we can access backend:
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, serverInfo => console.log(`Server is running on http://localhost:${serverInfo.port}`));
