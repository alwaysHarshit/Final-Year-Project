import {cleaning} from "../controller/cleaning.js";
import express from "express";
import {dataInsight} from "../controller/dataInsight.js";

export const router = express.Router();
router.get('/cleaning',cleaning);
router.get("/insight",dataInsight)
