import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';

import { sequelize } from './models/index.js';
import { typeDefs } from './graphql/typeDefs/index.js';
import { resolvers } from './graphql/resolvers/index.js';

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 5000;

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    // await sequelize.sync({ force: true });
    console.log('✅ Tables synced');
  } catch (error) {
    console.error('❌ Database error:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();
