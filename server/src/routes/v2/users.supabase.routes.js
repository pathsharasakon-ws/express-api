import { Router } from "express";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const PG_SELECT = "id, username, email, role, created_at, updated_at";

const isValidUuid = (value) => {
    const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return uuidPattern.test(value);
};

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

// Create user
router.post("/pg", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "username, email and password are required!",
            });
        }

        const { data, error } = await supabase
            .from("users")
            .insert([{ username, email, password }])
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data,
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

        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) updateData.password = password;

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