import prisma from "../utils/prismaClient.js";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //How to avoid a bug
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Your email and password are mandatory!" });
    }

    //Verificare existenta a userului asociat mailului din login
    const existUser = await prisma.user.findUnique({ where: { email } });

    if (existUser) {
      return res.status(400).json({
        error: "You already have an account associated to this email address.",
      });
    }

    //Password encryption and then hashing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //new user creation in the DB
    //Role is not established by the user itself at creation of user, of course
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    //send confirmation back to my user
    return res
      .status(201)
      .json({ message: "Your account was created with success!", user });
  } catch (error) {
    console.error("Error at: ", error);
    return res.status(500).json({ error: "An error occured on the server." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check if user trolls login button
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please enter both email and password." });
    }

    //Check existance of logged-in account in home page
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Email or password is incorrect!" });
    }

    //Check if hashed password from DB matches the introduced one
    const passwdIsValid = await bcrypt.compare(password, user.password);

    if (!passwdIsValid) {
      return res.status(400).json({ error: "Your password is incorrect." });
    }

    //JWT creation is needed for users since we have different roles for users
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "14d" }
    );

    //set the http-only cookie which contains the token
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //this is diploma thesis so I won't need https as for PROD env
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    //send back only user, without the password
    const { password: _, ...safeUser } = user;
    return res.json({
      message: "Authentification successful!",
      user: safeUser,
    });
  } catch (error) {
    console.error("There is a login error:", error);
    return res.status(500).json({ error: "There is a server error." });
  }
};

export const getMe = (req, res) => {
  //requireAuth already put req.user
  return res.json({ user: req.user });
};

export const logout = (req, res) => {
  //here the "token" cookie gets deleted
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.json({ message: "Logged out" });
};
