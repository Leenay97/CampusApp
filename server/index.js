import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';

import { sequelize } from './models/index.js';
import { typeDefs } from './graphql/typeDefs/index.js';
import { resolvers } from './graphql/resolvers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;

// ======================
// WS STORAGE
// ======================
const clients = new Set();

export function broadcast(event) {
  const msg = JSON.stringify(event);

  clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(msg);
    }
  });
}

const startServer = async () => {
  const app = express();

  const uploadDir = path.join(__dirname, 'uploads/avatars');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  app.use(cors());
  app.use(express.json());

  app.use(
    graphqlUploadExpress({
      maxFileSize: 5 * 1024 * 1024,
      maxFiles: 1,
    }),
  );

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      broadcast,
    }),
  });

  await server.start();
  server.applyMiddleware({ app });

  // ======================
  // HTTP + WS SERVER
  // ======================
  const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });

  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // ======================
  // DB INIT
  // ======================
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
};

startServer();
