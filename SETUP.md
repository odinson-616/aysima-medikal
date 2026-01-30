# 🚀 SETUP.md - Kurulum Kılavuzu

## Hızlı Başlangıç (5 Dakika)

### 1️⃣ Projeyi İndir
```bash
# GitHub'dan clone et (veya zip indir)
git clone https://github.com/yourusername/aysima-medikal.git
cd aysima-medikal
```

### 2️⃣ Supabase Hesabı Oluştur
1. https://supabase.com adresine git
2. "Sign up" butonuna tıkla
3. Google/GitHub ile giriş yap
4. Yeni project oluştur

### 3️⃣ Environment Setup
```bash
# .env dosyası oluştur
cp .env.example .env

# Supabase credentials'ını ekle
# Supabase Dashboard > Settings > API > URL ve Key'i kopyala
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4️⃣ Local Server Başlat
```bash
# Python installed ise
python -m http.server 8000

# Veya Node.js
npm install -g http-server
http-server

# Veya PHP
php -S localhost:8000

# Tarayıcıda aç
# http://localhost:8000
```

---

## 📊 Supabase Veritabanı Kurulumu

### SQL Komutları Çalıştırma

Supabase Dashboard'a git:
1. SQL Editor seç
2. Aşağıdaki scriptleri kopyala-yapıştır

### 1. Users Tablosu
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);
```

### 2. Categories Tablosu
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);
```

### 3. Products Tablosu
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    stock INT DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);
```

### 4. Orders Tablosu
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    address TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    items JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);
```

### 5. Coupons Tablosu
```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INT NOT NULL,
    valid_until DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view valid coupons" ON coupons
    FOR SELECT USING (valid_until > CURRENT_DATE);
```

### 6. Site Settings Tablosu
```sql
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement TEXT,
    phone TEXT,
    email TEXT,
    instagram TEXT,
    whatsapp TEXT,
    debug_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON site_settings
    FOR SELECT USING (true);
```

---

## 🔐 Supabase Auth Konfigürasyonu

### Email Confirmation Ayarı
1. Supabase Dashboard > Authentication > Email Templates
2. Confirmation e-mail'i özelleştir
3. Redirect URL'i ayarla: `https://yourdomain.com`

### OAuth Providers (Opsiyonel)
1. Authentication > Providers
2. Google / GitHub / Facebook seç
3. Credentials ekle
4. Enable et

---

## 🎨 Tema Özelleştirme

### CSS Variables (css/style.css)
```css
:root {
    --bordo: #7b1e2b;              /* Ana renk */
    --bordo-hover: #5d1620;         /* Hover rengi */
    --arka-plan: #f5f6f8;           /* Arka plan */
    --text-dark: #2c3e50;           /* Koyu text */
    --text-light: #7f8c8d;          /* Açık text */
    --success: #27ae60;             /* Başarı rengi */
    --danger: #e74c3c;              /* Hata rengi */
}
```

### Logo Değiştirme
1. `logo.png` dosyasını kendi logonla değiştir
2. Boyut: 50px x 50px önerilen
3. Format: PNG, JPEG, SVG

---

## 📱 Mobile Testing

### Chrome DevTools
1. F12 aç
2. Device Toggle Toolbar (Ctrl+Shift+M)
3. iPhone/Android seç
4. Responsive tasarım kontrol et

### Actual Device Testing
```bash
# Bilgisayar IP'sini bul
ipconfig getifaddr en0  # Mac
ip addr show            # Linux
ipconfig                # Windows

# Mobil cihazda aç:
# http://192.168.1.100:8000
```

---

## 🚀 Production Deployment

### Vercel (Önerilen)
```bash
# 1. Vercel'e kayıt ol
https://vercel.com

# 2. GitHub'ı bağla
# 3. Repository seç
# 4. Environment variables ekle
# 5. Deploy!
```

### Netlify
```bash
# 1. Netlify'a kayıt ol
https://netlify.com

# 2. New site from Git seç
# 3. Repository bağla
# 4. Build settings:
#    Build command: (boş bırak)
#    Publish directory: .
# 5. Environment variables ekle
# 6. Deploy!
```

### Custom Server (Node.js)
```bash
# 1. Hosting sağlayıcısı seç (Heroku, DigitalOcean, etc.)
# 2. Files'ı upload et
# 3. Web server başlat
# 4. Custom domain bağla
# 5. SSL sertifikası al (Let's Encrypt)
```

---

## ✅ Checklist

- [ ] Supabase hesabı oluşturuldu
- [ ] Veritabanı tablolarını oluşturdun
- [ ] .env dosyası ayarlandı
- [ ] Local server çalışıyor
- [ ] Ana sayfa yükleniyor
- [ ] Giriş/Kayıt çalışıyor
- [ ] Ürünler gösteriliyor
- [ ] Admin paneline erişebiliyorsun
- [ ] Mobile görünüm test edildi
- [ ] Deployment ayarlandı

---

## 🐛 Troubleshooting

### "Kategoriler yüklenemedi" hatası
- [ ] Supabase'de categories tablosunu kontrol et
- [ ] RLS policies'i kontrol et
- [ ] Tarayıcı console'da hata mesajını bak
- [ ] Supabase credentials'ın doğru olduğunu kontrol et

### "Giriş yapılamıyor" hatası
- [ ] Email confirmation enabled mi?
- [ ] User tablosu var mı?
- [ ] Auth RLS policies doğru mu?

### CORS Hatası
- [ ] Supabase Settings > API > CORS ayarını kontrol et
- [ ] Localhost 3000'i allowed origins'e ekle

### CSS Yüklenmeyip beyaz sayfa gösteriyor
- [ ] css/style.css yolu doğru mu?
- [ ] Dosya mevcut mu?
- [ ] Server dosyaları sunuyor mu?

---

## 📚 Kaynaklar

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Docs**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **HTML/CSS**: https://developer.mozilla.org/en-US/docs/Web/HTML
- **Font Awesome Icons**: https://fontawesome.com/icons

---

**Son Güncelleme:** 30 Ocak 2026
