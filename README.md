# AYSİMA MEDİKAL | E-Commerce Platform

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com)
[![Built with](https://img.shields.io/badge/built%20with-HTML%20%2F%20CSS%20%2F%20JavaScript-yellow.svg)](https://github.com)

**Sağlık sektörüne yönelik modern, responsive e-commerce platformu. Basit admin paneli ve güçlü özelliklerle e-ticarete hazır!**

> ⚠️ **Bu proje yapım aşamasındadır. Production'a geçmeden önce SETUP.md ve SECURITY.md dosyalarını okuyunuz.**

---

## ✨ Özellikler

### 🛒 Müşteri Tarafı
- ✅ Modern ve responsive tasarım
- ✅ Ürün arama ve filtreleme (kategori, fiyat)
- ✅ Sepet yönetimi
- ✅ Kupon kodu desteği
- ✅ Giriş/Kayıt sistemi (Supabase Auth)
- ✅ Sipariş oluşturma formu
- ✅ Kullanıcı profili
- ✅ Sosyal medya entegrasyonu

### 🔧 Admin Tarafı
- ✅ Dashboard (istatistikler)
- ✅ Ürün yönetimi (CRUD)
- ✅ Kategori yönetimi
- ✅ Sipariş izleme
- ✅ Kupon yönetimi
- ✅ Site ayarları
- ✅ Kullanıcı yönetimi

### 🔐 Güvenlik
- ✅ Supabase RLS (Row Level Security)
- ✅ JWT Authentication
- ✅ Input validation
- ✅ Environment variables
- ✅ Güvenlik best practices

---

## 🚀 Hızlı Başlangıç

### Sistem Gereksinimleri
- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)
- Node.js 14+ (opsiyonel, deployment için)
- Supabase hesabı (ücretsiz)

### Kurulum (5 Dakika)
```bash
# 1. Projeyi indir
git clone https://github.com/yourusername/aysima-medikal.git
cd aysima-medikal

# 2. .env dosyası oluştur
cp .env.example .env
# Supabase credentials'ını ekle

# 3. Local server başlat
python -m http.server 8000
# http://localhost:8000 adresinde aç
```

### Detaylı Kurulum
👉 [SETUP.md](SETUP.md) dosyasını oku

---

## 📁 Proje Yapısı

```
aysima-medikal/
├── index.html              # Ana sayfa
├── admin.html              # Admin paneli
├── product-detail.html     # Ürün detay sayfası
├── profile.html            # Kullanıcı profili
│
├── css/
│   ├── style.css          # Ana stiller
│   └── responsive.css     # Responsive kuralları
│
├── js/
│   ├── config.js          # Supabase konfigürasyonu
│   ├── main.js            # Sayfa yükleme ve mantık
│   ├── auth.js            # Giriş/Kayıt fonksiyonları
│   ├── products.js        # Ürün işlemleri
│   ├── cart.js            # Sepet işlemleri
│   ├── utils.js           # Yardımcı fonksiyonlar
│   ├── admin.js           # Admin panel fonksiyonları
│   └── profile.js         # Profil işlemleri
│
├── .env.example           # Environment örneği
├── .gitignore             # Git ignore kuralları
├── SETUP.md               # Kurulum kılavuzu
├── SECURITY.md            # Güvenlik kılavuzu
├── DATABASE_SCHEMA.md     # Veritabanı tasarımı
└── README.md              # Bu dosya
```

---

## 🎨 Teknoloji Stack

### Frontend
- **HTML5** - Semantik yapı
- **CSS3** - Modern styling (CSS Variables, Grid, Flexbox)
- **JavaScript (ES6+)** - Vanilla JS (framework bağımlılığı yok)
- **Font Awesome 6** - Icons

### Backend & Database
- **Supabase** - PostgreSQL + Auth + Real-time
- **PostgreSQL** - Relational database
- **Supabase RLS** - Güvenlik

### Deployment
- **Vercel** veya **Netlify** (önerilen)
- **Custom Node.js server**
- **GitHub Pages** (statik serving)

---

## 🔐 Güvenlik

### Yapılan Güvenlik Önlemleri
✅ Supabase RLS Policies  
✅ Environment Variables  
✅ Input Validation  
✅ XSS Protection  
✅ CORS Configuration  

### Yapılması Gerekenler
- [ ] Ödeme gateway entegrasyonu (Stripe/PayTR)
- [ ] Email verification sistemi
- [ ] 2FA (Two Factor Authentication)
- [ ] Rate limiting
- [ ] DDoS protection

👉 Detaylar için [SECURITY.md](SECURITY.md) dosyasını oku

---

## 📊 Veritabanı Yapısı

Ana Tablolar:
- **users** - Kullanıcı bilgileri
- **products** - Ürün katalogı
- **categories** - Ürün kategorileri
- **orders** - Siparişler
- **coupons** - İndirim kuponları
- **site_settings** - Site ayarları

👉 Detaylı schema: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

## 📱 Browser Desteği

| Browser | Sürüm | Durum |
|---------|-------|-------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| IE 11 | - | ❌ Not Supported |

---

## 🔄 Workflow

### Müşteri Akışı
```
1. Siteyi ziyaret et
2. Ürünleri gözat/ara
3. Sepete ekle
4. Giriş yap / Kayıt ol
5. Siparişi tamamla
6. Onay mesajı al
```

### Admin Akışı
```
1. admin.html'e git
2. Ürünleri yönet
3. Siparişleri kontrol et
4. Ayarları düzenle
```

---

## 🐛 Bilinen Sorunlar

- [ ] Payment integration eksik
- [ ] Email notification sistemi incomplete
- [ ] Advanced search filters
- [ ] Product reviews sistemi
- [ ] Wishlist/Favorites

---

## 🚀 Gelecek Güncellemeler

### v2.1 (Q1 2026)
- [ ] Payment gateway (Stripe/PayTR)
- [ ] Email notifications
- [ ] Advanced admin features

### v3.0 (Q2 2026)
- [ ] Mobile app (React Native)
- [ ] Inventory management
- [ ] Customer analytics
- [ ] Marketing automation

---

## 📚 Dokumentasyon

- **[SETUP.md](SETUP.md)** - Kurulum ve deployment
- **[SECURITY.md](SECURITY.md)** - Güvenlik best practices
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Veritabanı tasarımı
- **[Supabase Docs](https://supabase.com/docs)** - Official docs

---

## 💡 İpuçları & Best Practices

### Development
```bash
# Console'da debug özelliğini aktifle
DEBUG_MODE = true

# Network tab'da API calls'ı izle
# F12 > Network
```

### Performance
- Images lazy-load et
- CSS/JS minify et
- Caching stratejisi uygula
- CDN kullan (Cloudflare)

### SEO
- Meta tags düzelt
- Structured data ekle
- Sitemap oluştur
- robots.txt ayarla

---

## 🤝 Katkıda Bulunma

Katkılarınız çok değerlidir! 

```bash
# 1. Fork et
# 2. Feature branch oluştur
git checkout -b feature/AmazingFeature

# 3. Changes commit et
git commit -m 'Add some AmazingFeature'

# 4. Push et
git push origin feature/AmazingFeature

# 5. Pull Request aç
```

---

## 📝 Lisans

MIT License - [Lisans Detayları](LICENSE)

---

## 📞 İletişim

**Aysima Medikal**
- 📱 Phone: [0505 481 73 18](tel:905054817318)
- 📧 Email: aysimamedikal@gmail.com
- 📷 Instagram: [@aysimamedikal](https://instagram.com/aysimamedikal)
- 💬 WhatsApp: [Mesaj Gönder](https://wa.me/905054817318)

---

## 🙏 Teşekkürler

- Supabase - Backend & Database
- Font Awesome - Icons
- Vercel/Netlify - Hosting
- Community feedback

---

<div align="center">

**❤️ Bu projeyi beğendiysen, ⭐ star at!**

Daha fazla bilgi için [documentation](SETUP.md) kontrol et

---

**v2.0** | 30 Ocak 2026 | Türkiye 🇹🇷

</div>
