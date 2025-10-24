import express from "express";
import mongoose from 'mongoose';
const router = express.Router();

import { searchUsersByKeyword } from "../firebase/firestore/users.firestore.js";
import Accommodation from "../models/schemas/Accommodation.schema.js";
import Policy from "../models/schemas/Policy.schema.js";
import Room from "../models/schemas/Room.schema.js";
import Ticket from "../models/schemas/Ticket.schema.js";

// Helper method
const getPricePerNight = (accommodation, isAscending) => {
    if ([0, 1, 2].includes(accommodation.type)) {
        return accommodation.pricePerNight;
    } else {
        const roomPrices = accommodation.rooms.map((room) => room.pricePerNight);
        return isAscending ? Math.min(...roomPrices) : Math.max(...roomPrices);
    }
};

router.post("/", async (req, res) => {
    try {
        const {
            ownerId,
            name,
            city,
            avatar,
            address,
            pricePerNight,
            amenities = [],
            lat,
            lng,
            images = [],
            description,
            noteAccommodation,
            type,
            outstanding,
            options,
            activities,
        } = req.body;

        // Validate required fields
        if (!ownerId || !name || !city) {
            return res
                .status(400)
                .json({ message: "Nhập thêm tên và thành phố" });
        }

        const newAccommodation = new Accommodation({
            ownerId,
            name,
            city,
            avatar,
            address,
            pricePerNight: pricePerNight || 0,
            amenities,
            lat,
            lng,
            images,
            description,
            noteAccommodation,
            type,
            outstanding,
            options,
            activities,
        });

        const savedAccommodation = await newAccommodation.save();

        res.status(201).json({ accommodationId: savedAccommodation.id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const allowedFields = [
            "name",
            "avatar",
            "city",
            "address",
            "pricePerNight",
            "amenities",
            "lat",
            "lng",
            "images",
            "activities",
            "description",
            "noteAccommodation",
            "options",
            "outstanding",
            "type",
        ];

        const fieldsToUpdate = Object.keys(updateData).filter((key) =>
            allowedFields.includes(key),
        );

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }

        const updatedAccommodation = await Accommodation.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true },
        );

        if (!updatedAccommodation) {
            return res.status(404).json({ message: "Accommodation not found." });
        }

        res.status(200).json(updatedAccommodation);
    } catch (error) {
        console.error("Error updating accommodation:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
router.get("/", async (req, res) => {
    try {
        const {
            city,
            rate = 0,
            fromDate,
            toDate,
            sort,
            capacity,
            roomQuantity,
            isWithPet,
            amenities = "",
            pricePerNight,
            type,
            orderBy = "0",
            page = 1,
            limit = 10,
        } = req.query;
        if (!city || !fromDate || !toDate || !roomQuantity || !pricePerNight) {
            return res.status(400).json({
                message:
                    "Missing required fields: city, fromDate, toDate, roomQuantity, pricePerNight",
            });
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const capacityNumber = capacity ? parseInt(capacity, 10) : 2;
        const amenitiesArray = amenities
            ? amenities.split(",").map((a) => a.trim())
            : [];
        const isWithPetBool = isWithPet.toLowerCase() === "true";
        const pricePerNightRange = pricePerNight
            .split(",")
            .map((price) => parseInt(price.trim(), 10));
        const typeFilter = type?.split(",").map((t) => parseInt(t.trim(), 10))

        const accommodations = await Accommodation.find({
            city: city.toString(),
            ...(amenitiesArray.length > 0 && {
                amenities: { $all: amenitiesArray },
            }),
            ...(isWithPetBool && { amenities: { $in: ['FPET'] } }),
            ...(type?.length > 0 && {
                type: { $in: typeFilter }
            }),
            $or: [
                // Điều kiện 1: Kiểm tra giá của Accommodation
                {
                    pricePerNight: {
                        $gte: pricePerNightRange[0],
                        $lte: pricePerNightRange[1],
                    },
                },
                // Điều kiện 2: Kiểm tra giá của một trong các phòng trong Accommodation
                {
                    // Populate rooms để lấy dữ liệu chi tiết của Room
                    rooms: {
                        $in: await Room.find({
                            pricePerNight: { $gte: pricePerNightRange[0], $lte: pricePerNightRange[1] },
                        }).distinct('_id')  // Lấy các roomId có giá phù hợp
                    }
                },
            ],
        })
            .populate({
                path: "rooms",
                select: "name capacity quantity pricePerNight amenities description",
                match: (function () {
                    return function (doc) {
                        if ([0, 1, 2].includes(doc.type)) {
                            return {};
                        }
                        const capacityMatch = { capacity: { $gte: capacityNumber } };
                        // const amenitiesMatch =
                        //     amenitiesArray.length > 0
                        //         ? { amenities: { $all: amenitiesArray } }
                        //         : {};

                        const priceMatch = {
                            pricePerNight: {
                                $gte: pricePerNightRange[0],
                                $lte: pricePerNightRange[1],
                            },
                        };

                        return { ...capacityMatch, ...priceMatch };
                    };
                })(),
            })

        let filteredAccommodations = [];

        for (const accommodation of accommodations) {
            let isAccommodationValid = true;

            for (const room of accommodation.rooms) {
                const tickets = await Ticket.find({
                    accommodation: accommodation._id,
                    rooms: { $elemMatch: { roomId: room._id.toString() } },
                    $or: [
                        { fromDate: { $lte: fromDate }, toDate: { $gte: toDate } },
                        { fromDate: { $gte: fromDate, $lte: toDate } },
                        { toDate: { $gte: fromDate, $lte: toDate } },
                    ],
                });

                const bookedQuantity = tickets.reduce((sum, ticket) => {
                    const bookedRoom = ticket.rooms.find(
                        (r) => r.roomId === room._id.toString(),
                    );
                    return sum + (bookedRoom?.bookedQuantity || 0);
                }, 0);

                const availableRooms = room.quantity - bookedQuantity;

                if (availableRooms < roomQuantity) {
                    isAccommodationValid = false;
                    break;
                }
            }

            if (isAccommodationValid) {
                filteredAccommodations.push(accommodation);
            }
        }

        if (orderBy === "0") {
            // Order by rating
            filteredAccommodations.sort((a, b) => b.rating - a.rating);
        } else {
            // Order by pricePerNight
            filteredAccommodations.sort((a, b) => {
                const priceA = getPricePerNight(a, orderBy === "1");
                const priceB = getPricePerNight(b, orderBy === "1");

                return orderBy === "1" ? priceA - priceB : priceB - priceA;
            });
        }

        const total = filteredAccommodations.length;
        const paginatedAccommodations = filteredAccommodations.slice(
            (pageNumber - 1) * limitNumber,
            pageNumber * limitNumber,
        );

        let listAccommodations = paginatedAccommodations.filter((acc) => acc.rooms.length > 0)
        listAccommodations = listAccommodations.map(async (acc) => {
            const tickets = await Ticket.find({ accommodation: acc._id, star: { $gt: 0 } })
            return {
                ...acc.toObject(),
                totalReviews: tickets.length,
                averageRating: tickets.length > 0
                    ? tickets.reduce((sum, ticket) => sum + ticket.star, 0) / tickets.length
                    : 0,
            };
        });
        const resolvedAccommodations = await Promise.all(listAccommodations);
        listAccommodations = resolvedAccommodations.filter((acc) => acc.averageRating >= rate);

        switch (sort) {
            case 'S1':
                listAccommodations = listAccommodations.sort((a, b) => b.averageRating - a.averageRating);
                break;
            case 'S2':
                listAccommodations = listAccommodations.sort((a, b) => a.averageRating - b.averageRating);
                break;
            default:
                break;
        }

        res.status(200).json({
            accommodations: listAccommodations,
            pagination: {
                total: total,
                pages: Math.ceil(total / limitNumber),
                pageSize: limitNumber,
                current: pageNumber,
            },
        });
    } catch (error) {
        console.error("Error searching accommodations by name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/admin", async (req, res) => {
    try {
        const { ownerId, page = "1", limit = "10", keyword, city } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        let query = {};
        if (ownerId) {
            query.ownerId = ownerId;
        }
        if (keyword) {
            query.$or = [
                { name: { $regex: new RegExp(keyword, "i") } },
                { city: { $regex: new RegExp(keyword, "i") } },
            ];
        }
        if (city) {
            query.city = city;
        }

        const total = await Accommodation.countDocuments(query);
        const accommodations = await Accommodation.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate("policy");

        res.status(200).json({
            accommodations,
            pagination: {
                total,
                pages: Math.ceil(total / limitNumber),
                pageSize: limitNumber,
                current: pageNumber,
            },
        });
    } catch (error) {
        console.error("Error searching accommodations for admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/managed-verification", async (req, res) => {
    try {
        const { page = "1", limit = "10", isVerified, keyword, city } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        let query = {};
        if (isVerified !== undefined) {
            query.isVerified = isVerified === "true";
        }
        if (city) {
            query.city = city;
        }

        let ownerIds = [];
        if (keyword) {
            const users = await searchUsersByKeyword(keyword);
            ownerIds = users.map((user) => user.id);
            if (ownerIds.length === 0) {
                return res.status(200).json({
                    accommodations: [],
                    pagination: {
                        total: 0,
                        pages: 0,
                        pageSize: limitNumber,
                        current: 1,
                    },
                });
            }
            query.ownerId = { $in: ownerIds };
        }

        const total = await Accommodation.countDocuments(query);
        const accommodations = await Accommodation.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate(
                "policy",
                "checkIn checkOut cancellationPolicy additionalPolicy allowPetPolicy paymentMethod",
            )
            .populate("rooms", "name capacity quantity pricePerNight amenities");

        const pagination = {
            total,
            pages: Math.ceil(total / limitNumber),
            pageSize: limitNumber,
            current: pageNumber,
        };

        res.status(200).json({
            accommodations,
            pagination,
        });
    } catch (error) {
        console.error("Error fetching accommodations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const accommodation = await Accommodation.findById(id)
            .populate(
                "policy",
                "checkIn checkOut cancellationPolicy additionalPolicy allowPetPolicy paymentMethod",
            )
            .populate(
                "rooms",
                "name capacity quantity pricePerNight amenities description images",
            );

        const tickets = await Ticket.find({ accommodation: id, star: { $gt: 0 } }).populate('userId').populate('accommodation');

        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        res.status(200).json({ ...accommodation.toObject(), tickets });
    } catch (error) {
        console.error("Error fetching accommodation details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/review-count/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const accommodation = await Accommodation.findById(id)
        const tickets = await Ticket.find({ accommodation: id, star: { $gt: 0 } })

        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        const totalReviews = tickets.length;
        const averageRating = totalReviews > 0
            ? tickets.reduce((sum, ticket) => sum + ticket.star, 0) / totalReviews
            : 0;

        res.status(200).json({
            // ...accommodation.toObject(),
            // tickets,
            reviewSummary: {
                totalReviews,
                averageRating
            }
        });
    } catch (error) {
        console.error("Error fetching accommodation details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const allowedFields = [
            "name",
            "avatar",
            "city",
            "address",
            "pricePerNight",
            // "policy",
            "amenities",
            // "rooms",
            "lat",
            "lng",
            "images",
            "activities",
            "description",
            "noteAccommodation",
            "options",
            "outstanding",
            "type",
            // "isVerified",
            // "rating",
            // "ratingCount",
        ];

        const fieldsToUpdate = Object.keys(updateData).filter((key) =>
            allowedFields.includes(key),
        );

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }

        const updatedAccommodation = await Accommodation.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true },
        )
            .populate("policy", "checkIn checkOut cancellationPolicy allowPetPolicy")
            .populate("rooms", "name capacity quantity pricePerNight amenities");

        if (!updatedAccommodation) {
            return res.status(404).json({ message: "Accommodation not found." });
        }

        res.status(200).json(updatedAccommodation);
    } catch (error) {
        console.error("Error updating accommodation:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.patch("/:id/verify", async (req, res) => {
    try {
        const { id } = req.params;

        const accommodation = await Accommodation.findById(id);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        accommodation.isVerified = true;
        await accommodation.save();

        res
            .status(200)
            .json({ message: "Accommodation verified successfully", accommodation });
    } catch (error) {
        console.error("Error verifying accommodation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/:id/policy", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            checkIn,
            checkOut,
            cancellationPolicy,
            additionalPolicy,
            allowPetPolicy,
            ageLimitPolicy,
            paymentMethod = [],
        } = req.body;

        // Validate required fields for policy
        if (!checkIn || !checkOut) {
            return res
                .status(400)
                .json({ message: "Check-in and Check-out are required fields" });
        }

        // Find the accommodation by ID
        const accommodation = await Accommodation.findById(id);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        // Create new Policy document
        const newPolicy = new Policy({
            checkIn,
            checkOut,
            cancellationPolicy,
            additionalPolicy,
            allowPetPolicy,
            ageLimitPolicy,
            paymentMethod,
        });

        const savedPolicy = await newPolicy.save();

        // Update Accommodation with new Policy ID
        accommodation.policy = savedPolicy._id;
        await accommodation.save();

        res.status(201).json({ policyId: savedPolicy.id });
    } catch (error) {
        console.error("Error adding policy:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/:id/rooms", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            capacity,
            pricePerNight,
            amenities = [],
            quantity,
            images,
            description,
        } = req.body;

        const accommodation = await Accommodation.findById(id);
        if (!accommodation) {
            return res.status(404).json({ message: "Không tìm thấy chỗ nghỉ" });
        }

        const newRoom = new Room({
            accommodationId: id,
            name,
            capacity,
            pricePerNight,
            amenities,
            quantity,
            images,
            description,
        });
        const savedRoom = await newRoom.save();
        accommodation.rooms.push(savedRoom._id);
        await accommodation.save();

        res.status(201).json({
            message: `rooms created successfully for accommodation with id`,
        });
    } catch (error) {
        console.error("Error creating rooms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/:id/rooms", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const allowedFields = [
            "name",
            "capacity",
            "pricePerNight",
            "amenities",
            "quantity",
            "images",
            "description",
        ];

        const fieldsToUpdate = Object.keys(updateData).filter((key) =>
            allowedFields.includes(key),
        );

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }

        const accommodation = await Accommodation.findById(updateData.accommodationId);
        if (!accommodation) {
            return res.status(404).json({ message: "Chỗ nghỉ không tồn tại" });
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true },
        );
        if (!updatedRoom) {
            return res.status(404).json({ message: "Không tồn tại phòng." });
        }

        res.status(200).json(updatedRoom);
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.get("/:id/rooms", async (req, res) => {
    try {
        const { id } = req.params;

        const accommodation = await Accommodation.findById(id);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        const rooms = await Room.find({ _id: { $in: accommodation.rooms } });

        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error retrieving rooms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/:id/rooms/:roomId", async (req, res) => {
    try {
        const { id, roomId } = req.params;
        const updateData = req.body;

        const allowedFields = [
            "name",
            "capacity",
            "pricePerNight",
            "amenities",
            "quantity",
            "description",
        ];

        const fieldsToUpdate = Object.keys(updateData).filter((key) =>
            allowedFields.includes(key),
        );

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }

        const accommodation = await Accommodation.findById(id);
        if (!accommodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { $set: updateData },
            { new: true },
        );

        if (!updatedRoom) {
            return res.status(404).json({ message: "Room not found." });
        }

        res.status(200).json(updatedRoom);
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.get("/rooms/admin", async (req, res) => {
    try {
        const { page = "1", limit = "10", keyword, ownerId, } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        let query = {};
        if (keyword) {
            query.$or = [
                { name: { $regex: new RegExp(keyword, "i") } },
                { description: { $regex: new RegExp(keyword, "i") } },
            ];
        }

        if (ownerId) {
            // Kiểm tra ownerId có hợp lệ hay không
            if (!mongoose.Types.ObjectId.isValid(ownerId)) {
                console.error("🚨 Invalid ownerId format:", ownerId);
                return res.status(400).json({ error: "Invalid ownerId format" });
            }

            // Chuyển ownerId sang ObjectId
            const ownerIdObject = new mongoose.Types.ObjectId(ownerId);

            // Tìm tất cả accommodations thuộc ownerId
            const allAccommodations = (await Accommodation.find({ ownerId: ownerIdObject })).map(x => x._id);

            // Kiểm tra danh sách accommodations
            // Nếu tìm thấy accommodations, cập nhật query
            if (allAccommodations.length > 0) {
                query.accommodationId = { $in: allAccommodations };
            } else {
                console.warn("⚠️ No accommodations found for the given ownerId:", ownerId);
            }
        }

        const total = await Room.countDocuments(query);
        const rooms = await Room.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.status(200).json({
            rooms,
            pagination: {
                total,
                pages: Math.ceil(total / limitNumber),
                pageSize: limitNumber,
                current: pageNumber,
            },
        });
    } catch (error) {
        console.error("Error retrieving rooms for admin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
