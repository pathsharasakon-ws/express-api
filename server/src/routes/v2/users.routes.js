import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import { authUser } from "../../middlewares/authUser.js";
import { User } from "../../../models/user.model.js";

export const router = Router();

// 1. Read all users
router.get("/", async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        return res.json(users);
    } catch (err) {
        next(err);
    }
});

// 2. Create user
router.post("/", async (req, res, next) => {
    try {
        const { username, role, email, password } = req.body;

        if (!username || !role || !email || !password) {
            return res.status(400).json({ 
                error: "Username, role, email, and password are required!" 
            });
        }

        const newUser = await User.create({
            username,
            role, 
            email, 
            password
        });

        const { password: _password, ...userWithoutPassword } = newUser.toObject();
        return res.status(201).json(userWithoutPassword);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Email or username already exists" });
        }
        next(err);
    }
});

// 3. Update user
router.put("/:id", async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { username, role, email, password } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (username !== undefined) user.username = username;
        if (role !== undefined) user.role = role;
        if (email !== undefined) user.email = email;
        if (password) user.password = password;

        await user.save();

        const { password: _password, ...userWithoutPassword } = user.toObject();
        return res.json(userWithoutPassword);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Email or username already exists" });
        }
        next(err);
    }
});

// 4. Login user
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required!",
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // แก้ไข: expiresIn
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("accessToken", token, {
            httpOnly: true, 
            secure: isProd, 
            sameSite: isProd ? "none" : "lax", 
            path: "/", 
            maxAge: 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                email: user.email,
            },
        });
    } catch (err) {
        next(err);
    }
});

// Logout user
router.post("/logout", (req, res) => {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/"
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Check user token
router.get("/auth", authUser, async (req, res, next) => {
    try {
        const userId = req.user.user._id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }
        return res.status(200).json({ 
            success: true, 
            data: {
                _id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

// 6. Delete user
router.delete("/:id", authUser, async (req, res, next) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({ message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
});