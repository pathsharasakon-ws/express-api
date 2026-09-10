import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const PG_SELECT = "id, username, email, role, created_at, updated_at";
const LOGIN_SELECT = "id, username, email, role, created_at, updated_at, password";
const SALT_ROUNDS = 12;

async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

const isValidUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Get all users
router.get("/pg", async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
});

// Register user
router.post("/pg", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "username, email and password are required!",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters",
            });
        }

        const hashedPassword = await hashPassword(password);

        const { data, error } = await supabase
            .from("users")
            .insert({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
            })
            .select(PG_SELECT)
            .single();

        if (error?.code === "23505") {
            return res.status(409).json({
                error: "Email is already registered",
            });
        }

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
});

// Login user
router.post("/pg/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "email and password are required!",
            });
        }

        const { data: user, error } = await supabase
            .from("users")
            .select(LOGIN_SELECT)
            .eq("email", email.trim().toLowerCase())
            .maybeSingle();

        if (error) throw error;

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (err) {
        next(err);
    }
});

// Update user
router.put("/pg/:id", async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { username, email, password } = req.body;

        if (!isValidUuid(userId)) {
            return res.status(400).json({
                error: "Invalid user id",
            });
        }

        const updateData = {};

        if (username) {
            updateData.username = username.trim();
        }

        if (email) {
            updateData.email = email.trim().toLowerCase();
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({
                    error: "Password must be at least 8 characters",
                });
            }
            updateData.password = await hashPassword(password);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "At least one field is required",
            });
        }

        const { data, error } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", userId)
            .select(PG_SELECT)
            .maybeSingle();

        if (error?.code === "23505") {
            return res.status(409).json({
                error: "Email is already registered",
            });
        }

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
});

// Delete user
router.delete("/pg/:id", async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!isValidUuid(userId)) {
            return res.status(400).json({
                error: "Invalid user id",
            });
        }

        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("id", userId)
            .select(PG_SELECT)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        next(err);
    }
});
