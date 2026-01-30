# 📊 DATABASE_SCHEMA.md - Veritabanı Tasarımı

## Genel Mimarı

```
┌─────────────┐
│    Users    │ (Kullanıcılar)
└─────────────┘
      │
      ├──→ Orders (Siparişler)
      │
      └──→ Reviews (İncelemeler)

┌─────────────┐
│ Categories  │ (Kategoriler)
└─────────────┘
      │
      └──→ Products (Ürünler)
           │
           └──→ OrderItems (Sipariş Detayları)

┌─────────────┐
│   Coupons   │ (Kuponlar)
└─────────────┘
      │
      └──→ Orders (Siparişlerde kullanılır)

┌─────────────────┐
│ Site_Settings   │ (Site Ayarları)
└─────────────────┘
```

---

## 📋 Tablolar Detayı

### 1. Users (Kullanıcılar)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary Key |
| email | TEXT | Benzersiz e-mail |
| full_name | TEXT | Ad Soyad |
| phone | TEXT | Telefon Numarası |
| address | TEXT | Ev Adresi |
| is_admin | BOOLEAN | Admin Yetkisi |
| created_at | TIMESTAMP | Kayıt Tarihi |

**RLS Policies:**
- Users sadece kendi verilerini görebilir
- Admins tüm users'ı görebilir

---

### 2. Categories (Kategoriler)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Örnek Veriler:**
- Tıbbi Cihazlar
- İlaçlar & Vitaminler
- Sağlık Aksesuarları
- Bakım Ürünleri

**RLS Policies:**
- Herkes kategorileri görebilir
- Sadece admin ekleyebilir/düzenleyebilir

---

### 3. Products (Ürünler)
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    long_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    stock INT DEFAULT 0,
    low_stock_warning INT DEFAULT 5,
    sku TEXT UNIQUE,
    barcode TEXT,
    image_urls JSONB,
    specifications JSONB,
    tags TEXT[],
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexler:**
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
```

**RLS Policies:**
- Herkes aktif ürünleri görebilir
- Sadece admin yönetebilir

---

### 4. Orders (Siparişler)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    order_number TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city TEXT,
    customer_postal_code TEXT,
    
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    payment_method TEXT, -- credit_card, bank_transfer, cash
    payment_status TEXT DEFAULT 'pending', -- pending, completed, failed
    
    items JSONB, -- [{product_id, name, price, quantity, total}]
    notes TEXT,
    admin_notes TEXT,
    
    shipping_date TIMESTAMP,
    delivery_date TIMESTAMP,
    tracking_number TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexler:**
```sql
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

**RLS Policies:**
- Users kendi siparişlerini görebilir
- Admins tüm siparişleri görebilir

---

### 5. Order Items (Sipariş Detayları)
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6. Reviews (İncelemeler - Gelecek)
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 7. Coupons (Kuponlar)
```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT DEFAULT 'percent', -- percent, fixed
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount DECIMAL(10, 2),
    min_order_amount DECIMAL(10, 2),
    
    usage_limit INT, -- NULL = unlimited
    current_usage INT DEFAULT 0,
    
    valid_from DATE,
    valid_until DATE NOT NULL,
    
    applicable_categories UUID[],
    applicable_products UUID[],
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Örnek:**
- SUMMER2024: %20 indirim
- WELCOME: 50₺ indirim
- FREESHIPPING: Kargo ücretsiz

---

### 8. Site_Settings (Site Ayarları)
```sql
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Announcement
    announcement TEXT,
    announcement_color TEXT DEFAULT 'bordo',
    
    -- Contact
    phone TEXT,
    email TEXT,
    instagram TEXT,
    whatsapp TEXT,
    
    -- Shipping
    default_shipping_cost DECIMAL(10, 2),
    free_shipping_threshold DECIMAL(10, 2),
    
    -- Store Hours
    store_hours JSONB,
    
    -- Company Info
    company_name TEXT,
    company_address TEXT,
    company_tax_id TEXT,
    
    -- Settings
    debug_mode BOOLEAN DEFAULT false,
    maintenance_mode BOOLEAN DEFAULT false,
    
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Relations (İlişkiler)

### One-to-Many Relations
```
Categories 1 ──→ ∞ Products
Users 1 ──→ ∞ Orders
Orders 1 ──→ ∞ Order Items
Products 1 ──→ ∞ Reviews
```

### Many-to-Many Relations
```
Products ∞ ──→ ∞ Coupons (via coupon.applicable_products)
Categories ∞ ──→ ∞ Coupons (via coupon.applicable_categories)
```

---

## 📈 Performans Optimizasyonu

### Önemli Indexler
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admin ON users(is_admin);

-- Products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### Query Optimization
```sql
-- ✅ Kategorisine göre ürünleri al (indexed)
SELECT * FROM products 
WHERE category_id = $1 AND is_active = true
ORDER BY created_at DESC;

-- ✅ Kullanıcının siparişlerini al (indexed)
SELECT * FROM orders 
WHERE user_id = $1 
ORDER BY created_at DESC;
```

---

## 🔐 Veri Güvenliği

### PII (Personal Identifiable Information)
Korunan Alanlar:
- email
- phone
- address
- payment_info

Korunma Yöntemleri:
- RLS Policies ile erişim kontrolü
- Encrypted columns (backend'de)
- Regular backups

### GDPR Compliance
- Silme hakkı: User data silinebilir
- Portability: Data export yapılabilir
- Consent: Privacy policy gerekli

---

## 📊 Data Models

### Order Items JSON Örneği
```json
[
  {
    "product_id": "uuid",
    "product_name": "Ürün Adı",
    "product_image": "url",
    "quantity": 2,
    "unit_price": 99.99,
    "total_price": 199.98
  }
]
```

### Product Specifications JSON Örneği
```json
{
  "brand": "AYSİMA",
  "material": "Medikal Silikon",
  "size": "M",
  "color": "Beyaz",
  "warranty": "2 Yıl"
}
```

---

## 🧹 Data Maintenance

### Regular Cleanup
```sql
-- Inactive coupons'ı sil
DELETE FROM coupons WHERE valid_until < NOW() - INTERVAL '1 month';

-- Cancelled orders'ı archive et
-- ...
```

### Backup Strategy
- Daily automated backups
- Weekly full backup
- Monthly archive to cold storage

---

**Son Güncelleme:** 30 Ocak 2026
