// config.js
const SUPABASE_CONFIG = {
url: "https://eqpioawtdwkaeuxpfspt.supabase.co",
key: "sb_publishable_j1qHO04E6qvGJxoQksdHlA_p89plyCA"
};
const supabase = window.supabase.createClient(
SUPABASE_CONFIG.url,
SUPABASE_CONFIG.key
);
// Global state
const APP = {
currentUser: JSON.parse(localStorage.getItem('aysima_user')) || null,
masterData: [],
cart: JSON.parse(localStorage.getItem('aysima_cart')) || [],
// Local storage'a kaydet
saveUser: function(user) {
this.currentUser = user;
localStorage.setItem('aysima_user', JSON.stringify(user));
},
saveCart: function() {
localStorage.setItem('aysima_cart', JSON.stringify(this.cart));
}
};
