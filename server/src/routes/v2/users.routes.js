import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../../../models/user.model.js";

export const router = Router();

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

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
        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            username, 
            email, 
            password: hashedPassword
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

        let updateData = { username, email };
        if (password) {
            updateData.password = await hashPassword(password);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
            ).select("-password");
            
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
// Login user
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required!",
            });
        }
        // Find User by email
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        const { password: _password, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword,
        });
    } catch (err) {
        next(err);
 }});


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