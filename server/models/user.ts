import mongoose, { Document, Schema, Model } from "mongoose";

// 1. Define the interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

// 2. Define the schema
const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// 3. Export the model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
