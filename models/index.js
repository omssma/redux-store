const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const ItemSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  value: {
    type: Number,
  },
  image: {
    type: String,
  },
});

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Invalid email address."],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    items: [ItemSchema],
  },
  {
    toJSON: true,
    versionKey: false,
  }
);

// encrypt password before saving new user
UserSchema.pre("save", async function (next) {
  const user = await User.findById(this._id);
  if (!user) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// encrypt password before saving updated user
UserSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    const saltRounds = 10;
    this._update.password = await bcrypt.hash(
      this._update.password,
      saltRounds
    );
  }

  next();
});

// compare the incoming password with the encrypted password
UserSchema.method("checkPassword", async function (password) {
  return bcrypt.compare(password, this.password);
});

const User = model("User", UserSchema);

module.exports = { User };
