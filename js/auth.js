// auth.js - Kullanıcı Kimlik Doğrulama

// =============================
// AUTH MODAL AÇ
// =============================
function openAuth(mode = 'login') {
    const modal = document.getElementById("auth-modal");
    const overlay = document.getElementById("auth-overlay");
    
    if (!modal || !overlay) {
        console.error("❌ Auth modal elemanları bulunamadı!");
        return;
    }

    modal.style.display = "block";
    overlay.style.display = "block";
    
    if (mode === 'login') {
        renderLoginForm();
    } else {
        renderRegisterForm();
    }
}

// =============================
// AUTH MODAL KAPAT
// =============================
function closeAuth() {
    const modal = document.getElementById("auth-modal");
    const overlay = document.getElementById("auth-overlay");
    
    if (modal) modal.style.display = "none";
    if (overlay) overlay.style.display = "none";
}

// =============================
// GİRİŞ FORMU RENDER
// =============================
function renderLoginForm() {
    const title = document.getElementById("auth-title");
    const content = document.getElementById("auth-content");
    
    if (!title || !content) return;

    title.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş Yap';
    
    content.innerHTML = `
        <form onsubmit="handleLogin(event)" style="padding: 25px;">
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> E-posta</label>
                <input 
                    type="email" 
                    id="login-email" 
                    placeholder="ornek@email.com" 
                    required
                    autocomplete="email">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Şifre</label>
                <input 
                    type="password" 
                    id="login-password" 
                    placeholder="••••••••" 
                    required
                    autocomplete="current-password">
            </div>
            
            <button type="submit" class="submit-btn">
                <i class="fas fa-sign-in-alt"></i> Giriş Yap
            </button>
            
            <div style="
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e1e4e8;
            ">
                <p style="color: #7f8c8d; font-size: 14px;">
                    Hesabınız yok mu? 
                    <a href="#" 
                       onclick="event.preventDefault(); renderRegisterForm();"
                       style="color: var(--bordo); font-weight: 600; text-decoration: none;">
                        Kayıt Olun
                    </a>
                </p>
            </div>
        </form>
    `;
}

// =============================
// KAYIT FORMU RENDER
// =============================
function renderRegisterForm() {
    const title = document.getElementById("auth-title");
    const content = document.getElementById("auth-content");
    
    if (!title || !content) return;

    title.innerHTML = '<i class="fas fa-user-plus"></i> Kayıt Ol';
    
    content.innerHTML = `
        <form onsubmit="handleRegister(event)" style="padding: 25px;">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Ad Soyad</label>
                <input 
                    type="text" 
                    id="register-fullname" 
                    placeholder="Adınız Soyadınız" 
                    required
                    autocomplete="name">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> E-posta</label>
                <input 
                    type="email" 
                    id="register-email" 
                    placeholder="ornek@email.com" 
                    required
                    autocomplete="email">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Şifre</label>
                <input 
                    type="password" 
                    id="register-password" 
                    placeholder="En az 6 karakter" 
                    required
                    minlength="6"
                    autocomplete="new-password">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Şifre Tekrar</label>
                <input 
                    type="password" 
                    id="register-password-confirm" 
                    placeholder="Şifrenizi tekrar girin" 
                    required
                    minlength="6"
                    autocomplete="new-password">
            </div>
            
            <button type="submit" class="submit-btn">
                <i class="fas fa-user-plus"></i> Kayıt Ol
            </button>
            
            <div style="
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e1e4e8;
            ">
                <p style="color: #7f8c8d; font-size: 14px;">
                    Zaten hesabınız var mı? 
                    <a href="#" 
                       onclick="event.preventDefault(); renderLoginForm();"
                       style="color: var(--bordo); font-weight: 600; text-decoration: none;">
                        Giriş Yapın
                    </a>
                </p>
            </div>
        </form>
    `;
}

// =============================
// GİRİŞ İŞLEYİCİSİ
// =============================
async function handleLogin(event) {
    event.preventDefault();

    const emailEl = document.getElementById("login-email");
    const passwordEl = document.getElementById("login-password");
    
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";

    if (!email || !password) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Lütfen geçerli bir e-posta adresi girin!");
        return;
    }

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log("✅ Giriş başarılı:", data.user);
        alert("Hoş geldiniz! " + data.user.email);
        
        closeAuth();
        location.reload(); // Sayfayı yenile

    } catch (err) {
        console.error("❌ Giriş hatası:", err);
        
        let errorMessage = "Giriş yapılırken bir hata oluştu.";
        
        if (err.message.includes("Invalid login credentials")) {
            errorMessage = "E-posta veya şifre hatalı!";
        } else if (err.message.includes("Email not confirmed")) {
            errorMessage = "Lütfen e-posta adresinizi onaylayın!";
        }
        
        alert(errorMessage);
    }
}

// =============================
// KAYIT İŞLEYİCİSİ
// =============================
async function handleRegister(event) {
    event.preventDefault();

    const fullnameEl = document.getElementById("register-fullname");
    const emailEl = document.getElementById("register-email");
    const passwordEl = document.getElementById("register-password");
    const confirmEl = document.getElementById("register-password-confirm");
    
    const fullname = fullnameEl ? fullnameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const passwordConfirm = confirmEl ? confirmEl.value : "";

    // Validasyonlar
    if (!fullname || !email || !password || !passwordConfirm) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    if (fullname.length < 3) {
        alert("Ad soyad en az 3 karakter olmalıdır!");
        return;
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Lütfen geçerli bir e-posta adresi girin!");
        return;
    }

    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır!");
        return;
    }

    if (password !== passwordConfirm) {
        alert("Şifreler eşleşmiyor!");
        return;
    }

    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullname
                }
            }
        });

        if (error) throw error;

        console.log("✅ Kayıt başarılı:", data);
        
        alert(
            "Kayıt başarılı! 🎉\n\n" +
            "E-posta adresinize bir onay linki gönderildi.\n" +
            "Lütfen e-postanızı kontrol edin ve hesabınızı onaylayın."
        );
        
        closeAuth();
        renderLoginForm(); // Login formuna geç

    } catch (err) {
        console.error("❌ Kayıt hatası:", err);
        
        let errorMessage = "Kayıt olurken bir hata oluştu.";
        
        if (err.message.includes("already registered")) {
            errorMessage = "Bu e-posta adresi zaten kayıtlı!";
        } else if (err.message.includes("Password should be")) {
            errorMessage = "Şifre en az 6 karakter olmalıdır!";
        }
        
        alert(errorMessage);
    }
}

// =============================
// ŞİFRE SIFIRLAMA
// =============================
async function handlePasswordReset() {
    const email = prompt("Şifre sıfırlama için e-posta adresinizi girin:");
    
    if (!email) return;

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Lütfen geçerli bir e-posta adresi girin!");
        return;
    }

    try {
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });

        if (error) throw error;

        alert("Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.");

    } catch (err) {
        console.error("❌ Şifre sıfırlama hatası:", err);
        alert("Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.");
    }
}

// =============================
// GOOGLE İLE GİRİŞ (OPSİYONEL)
// =============================
async function signInWithGoogle() {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;

    } catch (err) {
        console.error("❌ Google giriş hatası:", err);
        alert("Google ile giriş yapılırken bir hata oluştu.");
    }
}
