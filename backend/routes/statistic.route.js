import express from "express";
import moment from "moment";

import Accommodation from "../models/schemas/Accommodation.schema.js";
import Ticket from "../models/schemas/Ticket.schema.js";

// Helper method
function genMonthlyAggregatePipeline(startOfMonth, endOfMonth, ownerId) {
    const queryConditions = {
        fromDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $ne: 2 },
    };

    const aggregatePipeline = [
        { $match: queryConditions },
        {
            $lookup: {
                from: "accommodations",
                localField: "accommodation",
                foreignField: "_id",
                as: "accommodation",
            },
        },
        { $unwind: "$accommodation" },
    ];

    if (ownerId) {
        aggregatePipeline.push({
            $match: {
                "accommodation.ownerId": ownerId,
            },
        });
    }

    return aggregatePipeline;
}

const router = express.Router();

router.get("/booking-summary", async (req, res) => {
    try {
        const { ownerId } = req.query;
        const thisMonth = moment().month();
        const startOfMonth = moment().month(thisMonth).startOf("month").format("YYYY-MM-DD");
        const endOfMonth = moment().month(thisMonth).endOf("month").format("YYYY-MM-DD");

        const tickets = await Ticket.find({
            fromDate: { $gte: startOfMonth, $lte: endOfMonth },
            ...(ownerId && { hostId: ownerId }),
        });

        const totalBooking = tickets.length;

        const successBooking = tickets.filter(
            (ticket) => ticket.status !== 2,
        ).length;

        const totalRevenue = tickets
            .filter(
                (ticket) => ticket.status !== 2,
            )
            .reduce((sum, ticket) => sum + ticket.totalPrice, 0);

        res.status(200).json({
            totalBooking,
            successBooking,
            totalRevenue,
            totalCancel: tickets.filter((ticket) => ticket.status === 2).length,
        });
    } catch (error) {
        console.error("Error fetching ticket summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/monthly-revenue", async (req, res) => {
    try {
        const { ownerId } = req.query;
        const currentYear = moment().year();
        const monthlyRevenue = [];

        for (let month = 0; month < 12; month++) {
            const startOfMonth = moment({ year: currentYear, month })
                .startOf("month")
                .format("YYYY-MM-DD");
            const endOfMonth = moment({ year: currentYear, month })
                .endOf("month")
                .format("YYYY-MM-DD");

            const aggregatePipeline = genMonthlyAggregatePipeline(
                startOfMonth,
                endOfMonth,
                ownerId
            );

            const tickets = await Ticket.aggregate(aggregatePipeline);

            const totalRevenue = tickets.reduce(
                (sum, ticket) => sum + ticket.totalPrice,
                0,
            );

            monthlyRevenue.push({ month: month + 1, totalRevenue });
        }

        res.status(200).json({ monthlyRevenue });
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/monthly-booking", async (req, res) => {
    try {
        const { ownerId } = req.query;
        const currentYear = moment().year();
        const monthlyBooking = [];

        for (let month = 0; month < 12; month++) {
            const startOfMonth = moment({ year: currentYear, month })
                .startOf("month")
                .format("YYYY-MM-DD");
            const endOfMonth = moment({ year: currentYear, month })
                .endOf("month")
                .format("YYYY-MM-DD");

            const aggregatePipeline = genMonthlyAggregatePipeline(
                startOfMonth,
                endOfMonth,
                ownerId,
            );

            const ticketCount = await Ticket.aggregate(aggregatePipeline);

            monthlyBooking.push({
                month: month + 1,
                ticketCount: ticketCount.length,
            });
        }

        res.status(200).json({ monthlyBooking });
    } catch (error) {
        console.error("Error fetching monthly booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/trending-destination", async (req, res) => {
    try {
        const trendingCities = await Ticket.aggregate([
            {
                $lookup: {
                    from: "accommodations",
                    localField: "accommodation",
                    foreignField: "_id",
                    as: "accommodation",
                },
            },
            { $unwind: "$accommodation" },
            {
                $group: {
                    _id: "$accommodation.city",
                    ticketCount: { $sum: 1 },
                },
            },
            { $sort: { ticketCount: -1 } },
            { $limit: 5 },
            {
                $project: {
                    city: "$_id",
                    ticketCount: 1,
                    _id: 0,
                },
            },
        ]);

        res.status(200).json({ trendingCities });
    } catch (error) {
        console.error("Error fetching trending destinations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/tickets", async (req, res) => {
    try {
        const { page = "1", limit = "10", ownerId } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        let query = {};
        if (ownerId) {
            // Fetch accommodations by ownerId
            const accommodations = await Accommodation.find({ ownerId: ownerId });
            const accommodationIds = accommodations.map((acc) => acc._id);

            if (accommodationIds.length === 0) {
                return res.status(200).json({
                    tickets: [],
                    pagination: { total: 0, pages: 0, pageSize: limitNumber, current: 1 },
                });
            }

            query.accommodation = { $in: accommodationIds };
        }

        const total = await Ticket.countDocuments(query);
        const tickets = await Ticket.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate(
                "accommodation",
                "name city address avatar outstanding activities description noteAccommodation type pricePerNight ownerId",
            )
            .populate("rooms.roomId", "name capacity description pricePerNight");

        const pagination = {
            total,
            pages: Math.ceil(total / limitNumber),
            pageSize: limitNumber,
            current: pageNumber,
        };

        res.status(200).json({
            tickets,
            pagination,
        });
    } catch (error) {
        console.error("Error retrieving ticket:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/top-accommodations", async (req, res) => {
    try {
        const topAccommodations = await Ticket.aggregate([
            {
                $match: { status: { $ne: 2 } } // Exclude canceled tickets
            },
            {
                $group: {
                    _id: "$accommodation",
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "accommodations", // Assuming the hosts are stored in the 'users' collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "accommodationDetails"
                }
            },
            {
                $unwind: "$accommodationDetails"
            },
            {
                $project: {
                    _id: 0,
                    accommodationId: "$_id",
                    totalRevenue: 1,
                    name: "$accommodationDetails.name",
                    city: "$accommodationDetails.city",
                    address: "$accommodationDetails.address",
                    avatar: "$accommodationDetails.avatar",
                }
            }
        ]);

        res.status(200).json({ topAccommodations });
    } catch (error) {
        console.error("Error fetching top accommodations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
