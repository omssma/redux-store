const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Item {
    _id: ID
    name: String
    description: String
    value: Int
    image: String
  }

  type User {
    _id: ID
    username: String
    email: String
    items: [Item]
  }

  type Auth {
    token: ID!
    user: User
  }

  input itemData {
    name: String
    description: String
    value: Int
    image: String
  }

  type Query {
    me: User
    users: [User]
    user(userId: ID, username: String): User
    item(userId: ID!, itemId: ID!): Item
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    updateUser(
      userId: ID!
      username: String
      email: String
      password: String
    ): User
    deleteUser(userId: ID!): User
    addItem(userId: ID!, content: itemData!): User
    updateItem(userId: ID!, itemId: ID!, content: itemData!): User
    deleteItem(userId: ID!, itemId: ID!): User
  }
`;

module.exports = typeDefs;
