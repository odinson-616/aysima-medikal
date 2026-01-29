// js/auth.js - Giriş/Kayıt sistemi
function openAuth() {
document.getElementById('auth-modal').classList.add('active');
document.getElementById('auth-overlay').classList.add('active');
}
function closeAuth() {
document.getElementById('auth-modal').classList.remove('active');
document.getElementById('auth-overlay').classList.remove('active');
clearAuthErrors();
}
function switchAuthTab(tab) {
document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
event.target.classList.add('active');
document.getElementById(tab + '-form').classList.add('active');
clearAuthErrors();
}
function showAuthError(message) {
const errorDiv = document.getElementById('auth-error');
errorDiv.textContent = message;
errorDiv.classList.add('show');
}
function clearAuthErrors() {
document.getElementById('auth-error').classList.remove('show');
}
async function handleLogin(e) {
e.preventDefault();
clearAuthErrors();
const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;
const btn = document.getElementById('login-btn');
btn.disabled = true;
btn.textContent = 'Giriş yapılıyor...';
try {
const { data, error } = await supabase.auth.signInWithPassword({
email,
});
if(error) {
showAuthError('Email veya şifre hatalı!');
btn.disabled = false;
btn.textContent = 'Giriş Yap';
return;
}
APP.saveUser(data.user);
updateUserUI();
closeAuth();
alert('Hoş geldiniz!');
document.getElementById('login-form').reset();
} catch(e) {
console.error('Login hatası:', e);
showAuthError('Bir hata oluştu. Lütfen tekrar deneyin.');
} finally {
btn.disabled = false;
btn.textContent = 'Giriş Yap';
}
}
async function handleSignup(e) {
e.preventDefault();
clearAuthErrors();
const name = document.getElementById('signup-name').value;
const email = document.getElementById('signup-email').value;
const password = document.getElementById('signup-password').value;
const phone = document.getElementById('signup-phone').value;
const btn = document.getElementById('signup-btn');
btn.disabled = true;
btn.textContent = 'Kayıt yapılıyor...';
try {
const { data: signupData, error: signupError } = await supabase.auth.signUp({
email,
password,
options: {
data: { full_name: name, phone: phone }
}
});
if(signupError) {
showAuthError(signupError.message);
btn.disabled = false;
btn.textContent = 'Kayıt Ol';
return;
}
const { error: profileError } = await supabase.from('users').insert([{
id: signupData.user.id,
email: email,
full_name: name,
phone: phone
}]);
if(profileError) throw profileError;
APP.saveUser(signupData.user);
updateUserUI();
closeAuth();
alert('Kayıt başarılı! Hoş geldiniz.');
document.getElementById('signup-form').reset();
} catch(e) {
console.error('Signup hatası:', e);
showAuthError('Kayıt başarısız. Bu email zaten kullanılıyor olabilir.');
} finally {
btn.disabled = false;
btn.textContent = 'Kayıt Ol';
}
}
function toggleUserMenu() {
document.getElementById('user-dropdown').classList.toggle('active');
}
async function logout() {
if(confirm('Çıkış yapmak istediğinize emin misiniz?')) {
await supabase.auth.signOut();
APP.currentUser = null;
localStorage.removeItem('aysima_user');
updateUserUI();
document.getElementById('user-dropdown').classList.remove('active');
location.reload();
}
}
function updateUserUI() {
const userDisplay = document.getElementById('user-display');
const userBtn = document.getElementById('user-btn');
if(APP.currentUser) {
const email = APP.currentUser.email.split('@')[0];
userDisplay.textContent = email;
userBtn.style.borderColor = 'var(--success)';
userBtn.style.color = 'var(--success)';
} else {
userDisplay.textContent = 'Giriş Yap';
userBtn.style.borderColor = 'var(--bordo)';
userBtn.style.color = 'var(--bordo)';
}
}
function goToProfile() {
if(!APP.currentUser) {
openAuth();
return;
}
alert('Profil sayfası hazırlanıyor...');
document.getElementById('user-dropdown').classList.remove('active');
}
function goToOrders() {
if(!APP.currentUser) {
openAuth();
return;
}
alert('Siparişlerim sayfası hazırlanıyor...');
document.getElementById('user-dropdown').classList.remove('active');
}
function goToAddresses() {
if(!APP.currentUser) {
openAuth();
return;
}
alert('Adreslerim sayfası hazırlanıyor...');
document.getElementById('user-dropdown').classList.remove('active');
}
document.addEventListener('click', (e) => {
if(!e.target.closest('.user-menu')) {
const dropdown = document.getElementById('user-dropdown');
if(dropdown) dropdown.classList.remove('active');
}
});
