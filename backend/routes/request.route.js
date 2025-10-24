import express from "express";
import Request from "../models/schemas/request.schema.js";
import User from "../models/schemas/user.schema.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { isResolved = false, page = "1", limit = "10" } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        let query = {};
        if (isResolved !== undefined) {
            query.isResolved = isResolved === "true";
        }

        const total = await Request.countDocuments(query);
        const requests = await Request.find(query).populate({
            path: "targetId",
            model: "User"
        }).skip((pageNumber - 1) * limitNumber).limit(limitNumber);

        const formattedRequests = requests.map((request) => ({
            ...request.toObject(),
            user: request.targetId,
        }));
        const pagination = {
            total,
            pages: Math.ceil(total / limitNumber),
            pageSize: limitNumber,
            current: pageNumber,
        };
        res.status(200).json({ requests: formattedRequests, pagination });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error fetching requests", error: error.message });
    }
});

router.patch("/:requestId", async (req, res) => {
    try {
        const { requestId } = req.params;
        const { isApprove } = req.body;

        // Tìm request theo ID
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        const user = await User.findById(request.targetId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found for this request" });
        }

        if (isApprove) {
            user.isRequestHostOwner = true;
        } else {
            user.isRequestHostOwner = false;
        }

        await user.save();

        request.isResolved = true;
        await request.save();

        res.status(200).json({
            message: isApprove ? "Chấp nhận thành công" : "Đã từ chối yêu cầu",
            request,
        });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Error updating request", error: error.message });
    }
});

export default router;
