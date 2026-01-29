// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = https://eqpioawtdwkaeuxpfspt.supabase.co;
const SUPABASE_ANON_KEY = sb_publishable_j1qHO04E6qvGJxoQksdHlA_p89plyCA;
// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ============================================
// APP STATE
// ============================================
const APP = {
currentUser: null,
cart: [],
products: [],
categories: [],
filters: {
category: null,
search: ''
}
};
// Export to global scope
window.supabase = supabase;
window.APP = APP;
console.log('✅ Config loaded successfully');
