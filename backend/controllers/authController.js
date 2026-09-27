import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//simple, good-enough email shape check (not a full RFC 5322 validator)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

//cookies must be "secure" (HTTPS only) in production; over plain HTTP in
//local development the browser would silently drop a secure cookie
const isProd = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //How to avoid a bug
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Your email and password are mandatory!" });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
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

    //Same error message whether the email or the password is wrong, so a
    //failed attempt cannot be used to find out which emails have an account
    //(account enumeration).
    const invalidCredentials = () =>
      res.status(400).json({ error: "Email or password is incorrect!" });

    if (!user) {
      return invalidCredentials();
    }

    //Check if hashed password from DB matches the introduced one
    const passwdIsValid = await bcrypt.compare(password, user.password);

    if (!passwdIsValid) {
      return invalidCredentials();
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
    //"secure" is only forced on in production: over plain HTTP (local dev)
    //a secure cookie would be silently dropped by the browser
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
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
  //clearCookie must be called with the same options the cookie was set
  //with (httpOnly/secure/sameSite), or the browser won't match and remove it
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  });

  return res.json({ message: "Logged out" });
};
