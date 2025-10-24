import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    isResolved: { type: Boolean, default: false },
    target: { type: String },
    targetId: { type: String },
});
export default mongoose.model("Request", RequestSchema);
