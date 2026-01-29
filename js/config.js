// js/config.js
const SUPABASE_URL = 'https://eqpioawtdwkaeuxpfspt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcGlvYXd0ZHdrYWV1eHBmc3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjk2ODUsImV4cCI6MjA4NTIwNTY4NX0.TIOQvOaSTlcd8xs6lbLKJYPkJgzGGTHY1MPb9BahAWs';

// Supabase'i window üzerinden başlatıyoruz (Hata almamak için kritik)
if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

window.APP = {
    currentUser: null,
    cart: JSON.parse(localStorage.getItem('aysima_cart')) || [],
    products: [],
    categories: []
};

console.log('✅ Config ve Supabase hazır.');
