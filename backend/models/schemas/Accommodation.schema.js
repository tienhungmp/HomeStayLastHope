import mongoose from "mongoose";

const AccommodationSchema = new mongoose.Schema({
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: false },
    city: { type: String, required: true },
    address: { type: String, required: false },
    pricePerNight: { type: Number },
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" },
    amenities: [{ type: String }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    lat: { type: String },
    lng: { type: String },
    images: [{ type: String }],
    activities: { type: String },
    description: { type: String, required: false },
    noteAccommodation: { type: String },
    options: { type: String },
    outstanding: { type: String },
    type: { type: Number },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
});

AccommodationSchema.index({ city: 1, pricePerNight: 1 });

export default mongoose.model("Accommodation", AccommodationSchema);
