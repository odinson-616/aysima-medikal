// ============================================
// SUPABASE CONFIGURATION
// ============================================
// Sadece bir kere deklarasyon yap!
if (typeof window.supabase === 'undefined') {
window.supabase = null;
}
const SUPABASE_URL = 'https://eqpioawtdwkaeuxpfspt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j1qHO04E6qvGJxoQksdHlA_p89plyCA';
// Initialize Supabase
window.supabase = window.supabase || {
createClient: function(url, key) {
return supabase.createClient(url, key);
}
};
// Gerçek Supabase client oluştur
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabaseClient;
// ============================================
// APP STATE (GLOBAL)
// ============================================
window.APP = {
currentUser: null,
cart: [],
products: [],
categories: [],
filters: {
category: null,
search: ''
}
};
console.log('✅ Config loaded successfully');
console.log('Supabase:', window.supabase);
console.log('APP:', window.APP);
