# 🔐 SECURITY.md - Güvenlik Kılavuzu

## Önemli Güvenlik Uyarıları

### ⚠️ KRITIK: Supabase Keys

**ASLA public repository'de keys göstermeyin!**

```javascript
// ❌ YANLIŞ (Production'da asla yapma!)
const SUPABASE_URL = "https://xxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhb..."; // Config.js'de açık

// ✅ DOĞRU
// .env dosyasında:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...

// main.js'de:
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 📋 Güvenlik Checklist

### Authentication
- [ ] Supabase RLS (Row Level Security) aktif
- [ ] Email verification zorunlu
- [ ] Password requirements tanımlanmış
- [ ] Session timeout var
- [ ] Secure cookies kullanılıyor
- [ ] 2FA desteği eklenmiş

### Database
- [ ] RLS policies tanımlanmış
- [ ] Özel user roles var
- [ ] admin tablosu var
- [ ] Rate limiting rules tanımlanmış
- [ ] Sensitive data encrypted
- [ ] Audit logs tutulmuyor

### API & Backend
- [ ] Input validation sunucu tarafında
- [ ] Output sanitization
- [ ] SQL injection koruması
- [ ] XSS koruması (Content-Security-Policy)
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Rate limiting aktif

### Frontend
- [ ] Sensitive data localStorage'da tutulmuyor
- [ ] API keys environment variables'da
- [ ] Error messages kullanıcı dostu
- [ ] Password fields marked properly
- [ ] Session management var
- [ ] CSRF tokens kullanılıyor

### Infrastructure
- [ ] DDoS protection (Cloudflare)
- [ ] WAF (Web Application Firewall)
- [ ] Regular backups yapılıyor
- [ ] Monitoring aktif
- [ ] Logging enabled
- [ ] Incident response plan var

---

## 🔒 RLS Policy Örnekleri

### Users Tablosu
```sql
-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admin tüm user verilerini görebilir
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin = true);
```

### Products Tablosu
```sql
-- Herkes ürünleri görebilir
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Sadece admin ürün ekleyebilir
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));
```

### Orders Tablosu
```sql
-- Kullanıcılar sadece kendi siparişlerini görebilir
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admin tüm siparişleri görebilir
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));
```

---

## 🛡️ Frontend Security Best Practices

### 1. Input Validation
```javascript
// Form validasyonu
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^[0-9]{10,11}$/;
  return regex.test(phone);
}
```

### 2. XSS Protection
```javascript
// Asla innerHTML'e doğrudan user input koymayın
❌ element.innerHTML = userInput;

// ✅ Bunun yerine:
element.textContent = userInput;

// Veya DOMPurify kullanın:
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 3. Secure Storage
```javascript
// ❌ localStorage'da sensitive data saklama
localStorage.setItem('apiKey', apiKey);

// ✅ Session süresi için memory'de tutun
let sessionToken = null;

// ✅ Httponly cookies (backend tarafında ayarlanır)
// JavaScript'ten erişilemiyor, XSS koruması sağlıyor
```

### 4. CSRF Protection
```javascript
// POST isteklerde CSRF token gönder
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/orders', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

---

## 🚀 Deployment Security

### Environment Variables (.env)
```
# ASLA bu dosyayı commit etmeyin!
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbg...
API_SECRET=xyz...
STRIPE_SECRET=sk_test_...
```

### Vercel/Netlify Setup
1. Project settings'e git
2. Environment Variables seç
3. Tüm secrets'ları ekle
4. Production ve Preview için ayrı values koy

### GitHub Setup
```bash
# .gitignore'da kontrol et
.env
.env.local
.env.*.local
node_modules/
```

---

## 🔍 Vulnerability Scanning

### Dependency Audit
```bash
npm audit
npm audit fix
```

### Security Headers Check
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

### SSL/TLS
- HTTPS enforced
- TLS 1.2+ only
- Strong ciphers
- Certificate valid and current

---

## 📊 Logging & Monitoring

### Error Logging
```javascript
// Production'da Sentry gibi service kullan
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: process.env.NODE_ENV
});

try {
  // code
} catch (error) {
  Sentry.captureException(error);
}
```

### Analytics
- User behavior tracking
- Error rate monitoring
- Performance metrics
- Security events logging

---

## 🚨 Incident Response

### Breach Detection
1. Anormal kullanıcı aktivitesi
2. Failed login attempts spike
3. Database connection errors
4. Unexpected API calls

### Response Steps
1. **Immediate**: Service durdurmak (gerekirse)
2. **Investigation**: Logs kontrol et
3. **Communication**: Affected users'a bildir
4. **Fix**: Patch yayınla
5. **Monitoring**: Ekstra monitoring aktif et

---

## 📞 Security Contact

**Vulnerability Reports**: security@example.com

---

**Son Güncelleme:** 30 Ocak 2026
