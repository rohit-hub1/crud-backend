import mongoose from "mongoose";

const teaSchema = new mongoose.Schema({
  name: String,
  price: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User
});

const Tea = mongoose.model("Tea", teaSchema);
export default Tea;
