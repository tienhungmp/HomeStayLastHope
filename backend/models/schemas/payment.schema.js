import mongoose from "mongoose";
const PaymentSchema = new mongoose.Schema({
    txnRef: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: Number, required: true, default: 0 },
    createAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", PaymentSchema);
