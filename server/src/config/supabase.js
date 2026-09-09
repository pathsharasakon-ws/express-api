import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing");
}

export const supabase = createClient(
    supabaseUrl,
    supabaseKey,
);

export async function connectSupabase() {
    const { error } = await supabase
        .from("users")
        .select("id")
        .limit(1);

    if (error) {
        throw error;
    }

    console.log("Supabase connected 🟢");
}