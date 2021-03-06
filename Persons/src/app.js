import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config();

import "./database";

import express from "express";
import cors from 'cors';
import helmet from 'helmet'


import personRoutes from "./routes/person";
import teacherRoutes from "./routes/teacher";
import responsibleRoutes from "./routes/responsible";
import studentRoutes from "./routes/student";
import addressRoutes from "./routes/address"


const whiteList = [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://177.44.248.32:8080',
  'http://177.44.248.32:8083'
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
    this.app.use("/persons/", personRoutes);
    this.app.use("/teachers/", teacherRoutes);
    this.app.use("/responsibles/", responsibleRoutes);
    this.app.use("/students/", studentRoutes);
    this.app.use("/address/", addressRoutes);
  }
}

export default new App().app;