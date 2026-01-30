const SUPABASE_URL = "https://eqpioawtdwkaeuxpfspt.supabase.co";
const SUPABASE_ANON_KEY = "ANON_KEY";

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
