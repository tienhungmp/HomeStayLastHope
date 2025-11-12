import Ticket from "../models/schemas/Ticket.schema.js";
import Accommodation from "../models/schemas/Accommodation.schema.js";
import User from "../models/schemas/user.schema.js";
import mongoose from "mongoose";

// Helper function to get date range
const getDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  return { startDate, endDate };
};

// Helper function to parse date string (format: "DD/MM/YYYY" or ISO)
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Check if it's ISO format
  if (dateString.includes('T') || dateString.includes('-')) {
    return new Date(dateString);
  }
  
  // Parse DD/MM/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  
  return new Date(dateString);
};

/**
 * @route GET /api/statistics/month
 * @desc Get statistics for current month
 * @query ownerId (optional) - Filter by host owner
 * @query month (optional) - Month (1-12)
 * @query year (optional) - Year
 */
export const getStaticsMonth = async (req, res) => {
  try {
    const { ownerId, month, year } = req.query;
    
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    const { startDate, endDate } = getDateRange(targetYear, targetMonth);

    // Build match query
    const matchQuery = {
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$fromDate" }, startDate] },
          { $lte: [{ $toDate: "$fromDate" }, endDate] }
        ]
      }
    };

    if (ownerId) {
      matchQuery.hostId = new mongoose.Types.ObjectId(ownerId);
    }

    // Get total bookings
    const totalBooking = await Ticket.countDocuments(matchQuery);

    // Get cancelled bookings (status = 3 or 4)
    const totalCancel = await Ticket.countDocuments({
      ...matchQuery,
      status: { $in: [3, 4] }
    });

    // Get total revenue (status = 2 - completed)
    const revenueData = await Ticket.aggregate([
      { $match: { ...matchQuery, status: 2 } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      totalBooking,
      totalCancel,
      totalRevenue,
      month: targetMonth,
      year: targetYear
    });
  } catch (error) {
    console.error("Error in getStaticsMonth:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/year-revenue
 * @desc Get monthly revenue for the year
 * @query ownerId (optional) - Filter by host owner
 * @query year (optional) - Target year
 */
export const getStaticsYearRevenue = async (req, res) => {
  try {
    const { ownerId, year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const matchQuery = {
      status: 2, // Only completed bookings
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$fromDate" }, startDate] },
          { $lte: [{ $toDate: "$fromDate" }, endDate] }
        ]
      }
    };

    if (ownerId) {
      matchQuery.hostId = new mongoose.Types.ObjectId(ownerId);
    }

    const monthlyRevenue = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          fromDateObj: { $toDate: "$fromDate" }
        }
      },
      {
        $group: {
          _id: { $month: "$fromDateObj" },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalRevenue: 1
        }
      }
    ]);

    // Fill missing months with 0 revenue
    const completeData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyRevenue.find(m => m.month === i + 1);
      return {
        month: i + 1,
        totalRevenue: monthData ? monthData.totalRevenue : 0
      };
    });

    res.json({ monthlyRevenue: completeData, year: targetYear });
  } catch (error) {
    console.error("Error in getStaticsYearRevenue:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/year-ticket
 * @desc Get monthly booking count for the year
 * @query ownerId (optional) - Filter by host owner
 * @query year (optional) - Target year
 */
export const getStaticsYearTicket = async (req, res) => {
  try {
    const { ownerId, year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const matchQuery = {
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$fromDate" }, startDate] },
          { $lte: [{ $toDate: "$fromDate" }, endDate] }
        ]
      }
    };

    if (ownerId) {
      matchQuery.hostId = new mongoose.Types.ObjectId(ownerId);
    }

    const monthlyBooking = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          fromDateObj: { $toDate: "$fromDate" }
        }
      },
      {
        $group: {
          _id: { $month: "$fromDateObj" },
          ticketCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          ticketCount: 1
        }
      }
    ]);

    // Fill missing months with 0 bookings
    const completeData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyBooking.find(m => m.month === i + 1);
      return {
        month: i + 1,
        ticketCount: monthData ? monthData.ticketCount : 0
      };
    });

    res.json({ monthlyBooking: completeData, year: targetYear });
  } catch (error) {
    console.error("Error in getStaticsYearTicket:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/top-router
 * @desc Get top trending cities
 * @query year (optional) - Target year
 * @query limit (optional) - Number of cities (default: 10)
 */
export const getTopRouter = async (req, res) => {
  try {
    const { year, limit = 10 } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const trendingCities = await Ticket.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [{ $toDate: "$fromDate" }, startDate] },
              { $lte: [{ $toDate: "$fromDate" }, endDate] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "accommodations",
          localField: "accommodation",
          foreignField: "_id",
          as: "accommodationData"
        }
      },
      { $unwind: "$accommodationData" },
      {
        $group: {
          _id: "$accommodationData.city",
          ticketCount: { $sum: 1 }
        }
      },
      { $sort: { ticketCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          city: "$_id",
          ticketCount: 1
        }
      }
    ]);

    res.json({ trendingCities, year: targetYear });
  } catch (error) {
    console.error("Error in getTopRouter:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/top-hosts
 * @desc Get top accommodations by revenue
 * @query year (optional) - Target year
 * @query limit (optional) - Number of accommodations (default: 5)
 */
export const getStaticsYearTopHost = async (req, res) => {
  try {
    const { year, limit = 5 } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const topAccommodations = await Ticket.aggregate([
      {
        $match: {
          status: 2, // Only completed bookings
          $expr: {
            $and: [
              { $gte: [{ $toDate: "$fromDate" }, startDate] },
              { $lte: [{ $toDate: "$fromDate" }, endDate] }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$accommodation",
          totalRevenue: { $sum: "$totalPrice" },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "accommodations",
          localField: "_id",
          foreignField: "_id",
          as: "accommodationData"
        }
      },
      { $unwind: "$accommodationData" },
      {
        $project: {
          _id: 0,
          accommodationId: "$_id",
          name: "$accommodationData.name",
          totalRevenue: 1,
          bookingCount: 1
        }
      }
    ]);

    res.json({ topAccommodations, year: targetYear });
  } catch (error) {
    console.error("Error in getStaticsYearTopHost:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/hosts
 * @desc Get all hosts
 */
export const getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find(
      { roles: "host" },
      { _id: 1, fullName: 1, email: 1, profilePictureUrl: 1 }
    ).sort({ fullName: 1 });

    res.json(hosts);
  } catch (error) {
    console.error("Error in getAllHosts:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/homestays-by-host
 * @desc Get homestays by host
 * @query ownerId (required)
 */
export const getHomestaysByHost = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({ error: "ownerId is required" });
    }

    const homestays = await Accommodation.find(
      { ownerId },
      { _id: 1, name: 1, avatar: 1, city: 1, address: 1, rating: 1 }
    ).sort({ name: 1 });

    res.json(homestays);
  } catch (error) {
    console.error("Error in getHomestaysByHost:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route GET /api/statistics/homestay-stats
 * @desc Get detailed stats for a homestay
 * @query accommodationId (required)
 * @query filter (required) - 'day' | 'week' | 'month'
 * @query date (optional) - Target date (ISO format or DD/MM/YYYY)
 */
export const getHomestayStats = async (req, res) => {
  try {
    const { accommodationId, filter, date } = req.query;

    if (!accommodationId || !filter) {
      return res.status(400).json({ 
        error: "accommodationId and filter are required" 
      });
    }

    const targetDate = date ? parseDate(date) : new Date();
    let startDate, endDate, groupBy, labels;

    // Determine date range and grouping based on filter
    switch (filter) {
      case 'day':
        // Show hourly stats for the selected day
        startDate = new Date(targetDate.setHours(0, 0, 0, 0));
        endDate = new Date(targetDate.setHours(23, 59, 59, 999));
        groupBy = { $hour: "$fromDateObj" };
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        break;

      case 'week':
        // Show daily stats for the week containing the date
        const dayOfWeek = targetDate.getDay();
        const diff = targetDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(targetDate.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        groupBy = { $dayOfWeek: "$fromDateObj" };
        labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        break;

      case 'month':
        // Show daily stats for the month
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
        groupBy = { $dayOfMonth: "$fromDateObj" };
        const daysInMonth = new Date(
          targetDate.getFullYear(), 
          targetDate.getMonth() + 1, 
          0
        ).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        break;

      default:
        return res.status(400).json({ error: "Invalid filter. Use 'day', 'week', or 'month'" });
    }

    const matchQuery = {
      accommodation: new mongoose.Types.ObjectId(accommodationId),
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$fromDate" }, startDate] },
          { $lte: [{ $toDate: "$fromDate" }, endDate] }
        ]
      }
    };

    // Get revenue data
    const revenueData = await Ticket.aggregate([
      { $match: { ...matchQuery, status: 2 } }, // Only completed
      {
        $addFields: {
          fromDateObj: { $toDate: "$fromDate" }
        }
      },
      {
        $group: {
          _id: groupBy,
          value: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get booking count data
    const bookingData = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          fromDateObj: { $toDate: "$fromDate" }
        }
      },
      {
        $group: {
          _id: groupBy,
          value: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format response with all labels
    const revenue = labels.map((label, index) => {
      const dataIndex = filter === 'day' ? index : 
                       filter === 'week' ? (index === 0 ? 1 : index + 1) :
                       index + 1;
      const item = revenueData.find(r => r._id === dataIndex);
      return {
        label,
        value: item ? item.value : 0
      };
    });

    const booking = labels.map((label, index) => {
      const dataIndex = filter === 'day' ? index : 
                       filter === 'week' ? (index === 0 ? 1 : index + 1) :
                       index + 1;
      const item = bookingData.find(b => b._id === dataIndex);
      return {
        label,
        value: item ? item.value : 0
      };
    });

    res.json({
      data: {
        revenue,
        booking,
        filter,
        date: targetDate.toISOString(),
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Error in getHomestayStats:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getStaticsMonth,
  getStaticsYearRevenue,
  getStaticsYearTicket,
  getTopRouter,
  getStaticsYearTopHost,
  getAllHosts,
  getHomestaysByHost,
  getHomestayStats,
};