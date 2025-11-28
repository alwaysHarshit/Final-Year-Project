import {analysisInternal} from "../controller/cleaning.js";
import express from "express";
import {internalDataInsight} from "../controller/internalDataInsight.js";

export const router = express.Router();

router.get('/analysis',analysisInternal);
router.get("/insight",internalDataInsight)
