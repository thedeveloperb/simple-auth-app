import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter username"],
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: [3, "Password must be longer than 3 characters"],
    },
  },
  { timestamps: true }
);

// fire a function after doc saved to database
// mongoose hook (function that fires after a certain mongoose event happens)
UserSchema.post("save", function (doc, next) {
  console.log("new user was created & saved", doc);
  next();
});

// fire a function before doc is save to database
UserSchema.pre("save", async function (next) {
  console.log("user is about to be created & saved", this);

  try {
    const salt = await bcrypt.genSalt(); // generate random characters and attach to front of user enterd password
    this.password = await bcrypt.hash(this.password, salt); // hash the user enterd password...no one will now what the password is
  } catch (error) {
    console.log(`SOMETHING WENT WRONG: ${error.message}`);
  }

  next();
});

// create a method on the user model to login user "login" <-- name of method
UserSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isAuth = await bcrypt.compare(password, user.password); // compare user typed in password vs hash pasword in database
    if (isAuth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;
