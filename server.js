const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { authMiddleware } = require("./utils/auth");
const bodyParser = require("body-parser"); // required for mongo-image-converter
const path = require("path");

const { typeDefs, resolvers } = require("./schemas");
const PORT = process.env.PORT || 3001;
const db = require("./config/connection");

const app = express();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  await server.start();

  server.applyMiddleware({ app });

  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

startServer();

app.use(bodyParser.json({ limit: "16mb", extended: true })); // required for mongo-image-converter
app.use(bodyParser.urlencoded({ limit: "16mb", extended: true })); // required for mongo-image-converter
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
