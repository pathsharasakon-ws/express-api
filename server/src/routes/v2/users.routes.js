import { Router } from "express";
import { User } from "../../../models/user.model.js";

export const router = Router();

// Read all users
router.get("/", async (req, res, next) => {
    try {
        const users = await User.find();
        return res.json(users);
    } catch (err) {
        next(err);
    }
});

// Create user
router.post("/", async (req, res, next) => {
    try {
        const {username, email, password} = req.body;

        if(!username || !email || !password){
        return res.status(400).json({ 
            error:"username, email and password are required!",
        });
    }

        const newUser = await User.create({
            username, 
            email, 
            password
        });

        const {
            password: _password, 
            ...userWithoutPassword} = newUser.toObject()

        return res.status(201).json(userWithoutPassword);
    } catch (err) {
        next(err);
    }
});

// Update user
router.put("/:id", async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { username, email, password } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username,
                email,
                password,
            },
            {
                new: true,
            },
        );

        if (!updatedUser) {
            return res.status(404).json({
                error: "User not found",
            });
        }
        return res.json(updatedUser);
    } catch (err) {
        next(err);
    }
});

// Delete user
router.delete("/:id", async (req, res, next) => {
    try {
    const userId = req.params.id;
    
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        return res.status(404).json({ 
            error: "User not found", });
    }
        return res.json({ 
            message: "User deleted successfully",});

    } catch (err) {
        next(err);
    }
});