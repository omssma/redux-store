const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // me query
    me: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id });
        return user;
      }

      throw new AuthenticationError("Please log in.");
    },

    // get all users
    users: async () => {
      return User.find({});
    },

    // query user by _id or username
    user: async (parent, { userId, username }) => {
      return User.findOne({
        $or: [{ _id: userId }, { username: username }],
      });
    },

    // query for item by itemId
    item: async (parent, { userId, itemId }, context) => {
      if (context.user) {
        const user = await User.findOne({
          _id: userId,
        });
        const item = user.items.id(itemId);
        return item;
      }

      throw new AuthenticationError("Please log in!");
    },
  },

  Mutation: {
    // login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials.");
      }

      const correctPw = await user.checkPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials.");
      }

      const token = signToken(user);
      return { token, user };
    },

    // add user
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });

      const token = signToken(user);

      return { token, user };
    },

    // update user
    updateUser: async (parent, { userId, ...args }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: userId },
          { ...args },
          { new: true }
        );
        return updatedUser;
      }

      throw new AuthenticationError("Please log in!");
    },

    // delete user
    deleteUser: async (parent, { userId }, context) => {
      if (context.user) {
        const deletedUser = await User.findByIdAndDelete({ _id: userId });
        return deletedUser;
      }

      throw new AuthenticationError("Please log in!");
    },

    // add item
    addItem: async (parent, { userId, content }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: userId },
          { $addToSet: { items: content } },
          { new: true }
        );
        return updatedUser;
      }

      throw new AuthenticationError("Please log in!");
    },

    // update item
    updateItem: async (parent, { userId, itemId, content }, context) => {
      if (context.user) {
        // insert updated item as new subdoc
        //  all fields need to be resent even with no changes
        await User.findByIdAndUpdate(
          { _id: userId },
          { $addToSet: { items: content } },
          { new: true }
        );

        // delete old item
        const user = await User.findById({ _id: userId });
        user.items.id(itemId).remove();
        user.save(function (err) {
          if (err) return handleError(err);
        });

        return user;
      }

      throw new AuthenticationError("Please log in!");
    },

    // delete item
    deleteItem: async (parent, { userId, itemId }, context) => {
      if (context.user) {
        const user = await User.findById({ _id: userId });
        user.items.id(itemId).remove();
        user.save(function (err) {
          if (err) return handleError(err);
        });

        return user;
      }

      throw new AuthenticationError("Please log in!");
    },
  },
};

module.exports = resolvers;
