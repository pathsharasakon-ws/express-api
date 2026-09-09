import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String,
            required: [true, "Username is required"],
            trim: true },
        email: { 
            type: String,
            required: [true, "Email is required"], 
            unique: true, 
            lowercase: true, 
            trim: true, 
            match: [/\S+@\S+\.\S+/, "Invalid email format"],
},
        password: { 
            type: String, 
            required: [true, "Password is requitred"],
            select: false 
        },
    },
    { timestamps: true },
);

export const User = mongoose.model("User", userSchema);