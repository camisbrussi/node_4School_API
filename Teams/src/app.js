import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config();

import "./database";

import express from "express";
import cors from 'cors';
import helmet from 'helmet'

import teamRoutes from "./routes/team";

const whiteList = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://177.44.248.32:8080',
  'http://177.44.248.32:8084',
]

const corsOptions = {
  origin: function (origin, callback){
    if(whiteList.indexOf(origin) !== -1 || !origin){
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors(corsOptions));
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use('/arquive/', express.static(resolve(__dirname, '..', "uploads", 'arquive')));
  }

  routes() {
    this.app.use("/teams/", teamRoutes);
  }
}

export default new App().app;