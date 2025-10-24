import mongoose from "mongoose";
import { Role } from "../../constants/role.constant.js";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [
                /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/,
                "Please enter a valid email address.",
            ],
        },
        password: { type: String, required: true },
        balance: { type: Number, required: false, default: 0 },
        fullName: { type: String, required: true },
        phone: { type: String, required: false },
        dob: { type: String, required: false },
        branchName: { type: String, required: false },
        gender: { type: Number, required: false },
        status: { type: Boolean, required: false, default: true },
        roles: [
            {
                type: String,
                required: true,
                enum: Object.values(Role),
            },
        ],
        bossId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        profilePictureUrl: { type: String, default: null },
        isRequestHostOwner: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export default mongoose.model("User", userSchema);
