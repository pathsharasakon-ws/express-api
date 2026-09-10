import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String,
            required: [true, "Username is required"],
            trim: true 
        },
        role: { 
            type: String, 
            enum: ["user", "admin"], 
            default: "user" 
        },
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
            required: [true, "Password is required"],
            select: false 
        },
    },
    { timestamps: true }
);

// Hash password อัตโนมัติก่อนบันทึก
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", userSchema);