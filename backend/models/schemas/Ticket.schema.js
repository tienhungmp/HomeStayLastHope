import mongoose from "mongoose";

const RoomBookingSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    bookedQuantity: { type: Number, required: true },
});

const TicketSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    accommodation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accommodation",
        required: true,
    },
    rooms: { type: [RoomBookingSchema] },
    bookedQuantity: { type: Number },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    review: { type: String, required: false },
    star: { type: Number, required: false },
    isShow: { type: Boolean, required: false },
});

export default mongoose.model("Ticket", TicketSchema);
