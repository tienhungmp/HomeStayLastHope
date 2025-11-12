import express from "express";
import {
  getStaticsMonth,
  getStaticsYearRevenue,
  getStaticsYearTicket,
  getTopRouter,
  getStaticsYearTopHost,
  getAllHosts,
  getHomestaysByHost,
  getHomestayStats,
} from "../controllers/statistics.controller.js";

const router = express.Router();

router.get("/month", getStaticsMonth);

router.get("/year-revenue", getStaticsYearRevenue);

router.get("/year-ticket", getStaticsYearTicket);

router.get("/top-router", getTopRouter);

router.get("/top-hosts", getStaticsYearTopHost);

router.get("/hosts", getAllHosts);

router.get("/homestays-by-host", getHomestaysByHost);

router.get("/homestay-stats", getHomestayStats);

export default router;
