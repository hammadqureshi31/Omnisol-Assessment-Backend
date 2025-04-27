import express, { urlencoded } from "express";
import { configDotenv } from "dotenv";
import userRoutes from './routes/userRoutes.js'
import cors from "cors";
import cookieParser from "cookie-parser";
import noteRoutes from './routes/noteRoutes.js';


configDotenv({path: "./.env"})

export const app = express();

app.use(express.json());
app.use(urlencoded({extended: false}));
app.use(cookieParser());


const allowedorigins = ["http://localhost:5173", "http://localhost:5173/user/signup"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedorigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use('/user', userRoutes);
app.use('/api', noteRoutes);
