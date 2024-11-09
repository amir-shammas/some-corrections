const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./../models/user.model");


exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    await userModel.registerValidation(req.body).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const userExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return res.status(409).json({
        message: "username or email is duplicated.",
      });
    }

    // const countOfRegisteredUser = await userModel.count();

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      // role: countOfRegisteredUser > 0 ? "USER" : "ADMIN",
      role: "USER",
      isBan: false,
    });

    const userObject = user.toObject();

    Reflect.deleteProperty(userObject, "password");

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30 day",
    });

    return res.status(201).json({ user: userObject, accessToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    await userModel.loginValidation(req.body).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const user = await userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json("There is no user with this email or username");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "password is not correct" });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30 day",
    });

    return res.json({ accessToken });
    
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    return res.json({ ...req.user });
  } catch (error) {
    next(error);
  }
};
