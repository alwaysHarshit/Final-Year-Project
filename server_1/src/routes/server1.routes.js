import {cleaning} from "../controller/cleaning.js";
import express from "express";

export const router = express.Router();
router.get('/cleaning',cleaning);
