//import librariile descarcate necesare serverului Express
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
//import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";

//declar dotenv pentru Prisma
dotenv.config();

//initializez Express
const app = express();

//Initializare Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
//app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/testimonials", testimonialRoutes);

//Pentru testarea ca serverul este in picioare
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Hello there! Congrats dude, your server works!",
  });
});

//Acum pornesc serverul si dau un output cu portul pe care Express asculta orice request venit din frontend
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serverul meu ruleaza pe portul ${PORT}`);
});
