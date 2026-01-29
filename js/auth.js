// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/** Giriş Yapma İşlemi */
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const statusDiv = document.getElementById('auth-status');
    const loginBtn = event.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        statusDiv.textContent = 'Email ve şifre gerekli!';
        statusDiv.style.color = 'red';
        return;
    }

    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Giriş yapılıyor...';
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            statusDiv.textContent = error.message;
            statusDiv.style.color = 'red';
            return;
        }

        window.APP.currentUser = data.user;
        if (typeof setLocalStorage === "function") setLocalStorage('user', data.user);
        
        statusDiv.textContent = 'Giriş başarılı!';
        statusDiv.style.color = 'green';
        
        setTimeout(() => {
            closeAuth();
            updateUserUI();
        }, 1000);

    } catch (err) {
        statusDiv.textContent = 'Giriş hatası: ' + err.message;
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'GİRİŞ YAP';
    }
}

/** Kayıt Olma İşlemi */
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const statusDiv = document.getElementById('auth-status');
    const signupBtn = event.target.querySelector('button[type="submit"]');

    if (!name || !email || !password) {
        statusDiv.textContent = 'Lütfen tüm alanları doldurun!';
        statusDiv.style.color = 'red';
        return;
    }

    if (password.length < 6) {
        statusDiv.textContent = 'Şifre en az 6 karakter olmalı!';
        statusDiv.style.color = 'red';
        return;
    }

    try {
        signupBtn.disabled = true;
        signupBtn.textContent = 'Kayıt yapılıyor...';
        statusDiv.textContent = '';

        const { data, error } = await window.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: name }
            }
        });

        if (error) {
            statusDiv.textContent = error.message;
            statusDiv.style.color = 'red';
            return;
        }

        statusDiv.textContent = 'Kayıt başarılı! Giriş yapılıyor...';
        statusDiv.style.color = 'green';
        
        window.APP.currentUser = data.user;
        if (typeof setLocalStorage === "function") setLocalStorage('user', data.user);

        // Profil tablosu varsa kayıt ekle (Opsiyonel)
        try {
            await window.supabase.from('profiles').insert({
                id: data.user.id,
                name: name,
                email: email
            });
        } catch (e) { console.log("Profil tablosu bulunamadı, geçiliyor."); }

        setTimeout(() => {
            closeAuth();
            updateUserUI();
        }, 1500);

    } catch (err) {
        statusDiv.textContent = 'Kayıt hatası: ' + err.message;
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'KAYIT OL';
    }
}

/** Çıkış İşlemi */
async function logout() {
    try {
        await window.supabase.auth.signOut();
        window.APP.currentUser = null;
        if (typeof removeLocalStorage === "function") removeLocalStorage('user');
        location.reload();
    } catch (err) {
        console.error('Çıkış hatası:', err.message);
    }
}

/** Kullanıcı Arayüzünü Güncelle */
function updateUserUI() {
    const userDisplay = document.getElementById('user-display');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (window.APP.currentUser) {
        const name = window.APP.currentUser.user_metadata?.name || window.APP.currentUser.email.split('@')[0];
        userDisplay.textContent = `👤 ${name}`;
        userDisplay.onclick = () => { if(confirm("Çıkış yapmak istiyor musunuz?")) logout(); };
        if (checkoutBtn) checkoutBtn.disabled = false;
    } else {
        userDisplay.textContent = '👤 Giriş Yap';
        userDisplay.onclick = openAuth;
        if (checkoutBtn) checkoutBtn.disabled = true;
    }
}

/** Modal Kontrolleri */
function openAuth() {
    document.getElementById('auth-overlay').style.display = 'block';
    document.getElementById('auth-modal').style.display = 'block';
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'none';
    const status = document.getElementById('auth-status');
    if(status) status.textContent = '';
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabLogin.style.borderBottom = '2px solid #7b1e2b';
        tabSignup.style.borderBottom = 'none';
        tabLogin.style.color = '#7b1e2b';
        tabSignup.style.color = '#999';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabSignup.style.borderBottom = '2px solid #7b1e2b';
        tabLogin.style.borderBottom = 'none';
        tabSignup.style.color = '#7b1e2b';
        tabLogin.style.color = '#999';
    }
}

/** Sayfa Açıldığında Kullanıcıyı Kontrol Et */
async function checkCurrentUser() {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (session) {
        window.APP.currentUser = session.user;
        updateUserUI();
    }
}

// Başlatıcılar
if (window.supabase) {
    window.supabase.auth.onAuthStateChange((event, session) => {
        window.APP.currentUser = session?.user || null;
        updateUserUI();
    });
}

document.addEventListener('DOMContentLoaded', checkCurrentUser);
console.log('✅ Auth loaded successfully');
            
