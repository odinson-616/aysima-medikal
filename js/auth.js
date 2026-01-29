// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================
/**
*/
async function handleLogin(event) {
event.preventDefault();
const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;
const errorDiv = document.getElementById('auth-error');
const loginBtn = document.getElementById('login-btn');
if (!email || !password) {
errorDiv.textContent = 'Email ve şifre gerekli!';
return;
}
try {
loginBtn.disabled = true;
loginBtn.textContent = 'Giriş yapılıyor...';
const { data, error } = await window.supabase.auth.signInWithPassword({
email,
});
if (error) {
errorDiv.textContent = error.message;
return;
}
window.APP.currentUser = data.user;
setLocalStorage('user', data.user);
showNotification('Başarıyla giriş yaptınız!', 'success');
closeAuth();
updateUserUI();
} catch (err) {
errorDiv.textContent = 'Giriş yapılamadı: ' + err.message;
} finally {
loginBtn.disabled = false;
loginBtn.textContent = 'Giriş Yap';
}
}
/**
*/
async function handleSignup(event) {
event.preventDefault();
const name = document.getElementById('signup-name').value;
const email = document.getElementById('signup-email').value;
const password = document.getElementById('signup-password').value;
const phone = document.getElementById('signup-phone').value;
const errorDiv = document.getElementById('auth-error');
const signupBtn = document.getElementById('signup-btn');
if (!name || !email || !password || !phone) {
errorDiv.textContent = 'Tüm alanlar gerekli!';
return;
}
if (password.length < 6) {
errorDiv.textContent = 'Şifre en az 6 karakter olmalı!';
return;
}
if (!isValidEmail(email)) {
errorDiv.textContent = 'Geçerli bir email adresi girin!';
return;
}
if (!isValidPhone(phone)) {
errorDiv.textContent = 'Geçerli bir telefon numarası girin!';
return;
}
try {
signupBtn.disabled = true;
signupBtn.textContent = 'Kayıt yapılıyor...';
const { data, error } = await window.supabase.auth.signUp({
email,
password,
options: {
data: {
name,
}
}
});
if (error) {
errorDiv.textContent = error.message;
return;
}
window.APP.currentUser = data.user;
setLocalStorage('user', data.user);
showNotification('Başarıyla kayıt oldunuz!', 'success');
// Profil tablosuna kullanıcı ekle
await window.supabase.from('profiles').insert({
id: data.user.id,
name,
email,
phone,
created_at: new Date().toISOString()
});
closeAuth();
updateUserUI();
} catch (err) {
errorDiv.textContent = 'Kayıt yapılamadı: ' + err.message;
} finally {
signupBtn.disabled = false;
signupBtn.textContent = 'Kayıt Ol';
}
}
/**
*/
async function logout() {
try {
const { error } = await window.supabase.auth.signOut();
if (error) {
showNotification('Çıkış yapılamadı!', 'error');
return;
}
window.APP.currentUser = null;
window.APP.cart = [];
removeLocalStorage('user');
removeLocalStorage('cart');
showNotification('Başarıyla çıkış yaptınız!', 'success');
updateUserUI();
location.reload();
} catch (err) {
showNotification('Hata: ' + err.message, 'error');
}
}
/**
*/
function updateUserUI() {
const userBtn = document.getElementById('user-btn');
const userDisplay = document.getElementById('user-display');
const checkoutBtn = document.getElementById('checkout-btn');
if (window.APP.currentUser) {
const email = window.APP.currentUser.email;
userDisplay.textContent = email.split('@')[0];
userBtn.style.color = 'var(--success)';
checkoutBtn.disabled = false;
} else {
userDisplay.textContent = 'Giriş Yap';
userBtn.style.color = 'inherit';
checkoutBtn.disabled = true;
}
}
/**
*/
function openAuth() {
document.getElementById('auth-overlay').style.display = 'block';
document.getElementById('auth-modal').style.display = 'block';
}
/**
*/
function closeAuth() {
document.getElementById('auth-overlay').style.display = 'none';
document.getElementById('auth-modal').style.display = 'none';
document.getElementById('auth-error').textContent = '';
document.getElementById('login-form').reset();
document.getElementById('signup-form').reset();
}
/**
*/
function switchAuthTab(tab) {
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabs = document.querySelectorAll('.auth-tab');
tabs.forEach(t => t.classList.remove('active'));
event.target.classList.add('active');
if (tab === 'login') {
loginForm.classList.add('active');
signupForm.classList.remove('active');
} else {
loginForm.classList.remove('active');
signupForm.classList.add('active');
}
document.getElementById('auth-error').textContent = '';
}
/**
*/
function toggleUserMenu() {
const dropdown = document.getElementById('user-dropdown');
dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}
/**
*/
function goToProfile() {
if (!window.APP.currentUser) {
showNotification('Lütfen önce giriş yapın!', 'error');
openAuth();
return;
}
alert('Profil sayfası hazırlanıyor...');
}
/**
*/
function goToOrders() {
if (!window.APP.currentUser) {
showNotification('Lütfen önce giriş yapın!', 'error');
openAuth();
return;
}
alert('Siparişler sayfası hazırlanıyor...');
}
/**
*/
function goToAddresses() {
if (!window.APP.currentUser) {
showNotification('Lütfen önce giriş yapın!', 'error');
openAuth();
return;
}
alert('Adresler sayfası hazırlanıyor...');
}
/**
*/
async function checkCurrentUser() {
try {
const { data, error } = await window.supabase.auth.getSession();
if (error) {
console.error('Session hatası:', error);
return;
}
if (data.session && data.session.user) {
window.APP.currentUser = data.session.user;
setLocalStorage('user', data.session.user);
updateUserUI();
} else {
const savedUser = getLocalStorage('user');
if (savedUser) {
window.APP.currentUser = savedUser;
updateUserUI();
}
}
} catch (err) {
console.error('Kullanıcı kontrol hatası:', err);
}
}
/**
*/
window.supabase.auth.onAuthStateChange((event, session) => {
if (session && session.user) {
window.APP.currentUser = session.user;
updateUserUI();
} else {
window.APP.currentUser = null;
}
});
console.log('✅ Auth loaded successfully');
