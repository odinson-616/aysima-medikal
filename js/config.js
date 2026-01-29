// js/config.js
const SUPABASE_URL = 'https://eqpioawtdwkaeuxpfspt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcGlvYXd0ZHdrYWV1eHBmc3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMTk3OTksImV4cCI6MjA1Mjg5NTc5OX0.CvcbovBdNk9gLKZ4W-WeyQkPUIf6W55D6M7QIcTzIxs';

// Supabase'i window üzerinden başlatıyoruz
if (window.supabase) {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('❌ Supabase kütüphanesi yüklenemedi!');
}

// Global Uygulama Hafızası
window.APP = {
    currentUser: null,
    cart: JSON.parse(localStorage.getItem('aysima_cart')) || [],
    products: [],
    categories: []
};

console.log('✅ Config yüklendi');
