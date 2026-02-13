# E-Commerce Admin Panel - To'liq Frontend

Next.js 14, Redux Toolkit, Tailwind CSS

## ✅ To'liq Tayyor

Barcha sahifalar va funksiyalar tayyor:
- ✅ Login (JWT auth)
- ✅ Dashboard (statistika)
- ✅ Categories CRUD (4 til)
- ✅ Products CRUD (4 til + rasmlar)
- ✅ Sidebar navigation
- ✅ Professional dizayn

## 🚀 Ishga Tushirish

```bash
# 1. Arxivni oching
tar -xzf ecommerce-frontend.tar.gz
cd ecommerce-admin-frontend

# 2. Dependencies
npm install

# 3. Backend'ni ishga tushiring (port 3001)

# 4. Frontend'ni ishga tushiring
npm run dev
```

Sayt: http://localhost:3000

## 🔑 Login Ma'lumotlari

```
Email: admin@example.com
Password: Admin123!
```

## 📁 Sahifalar

### 1. Login (/login)
- Chiroyli login page
- JWT tokenlar bilan auth
- Auto-refresh token

### 2. Dashboard (/dashboard)
- Umumiy statistika
- Kategoriyalar va mahsulotlar soni
- So'nggi qo'shilganlar

### 3. Categories (/categories)
- Jadvaldagi ro'yxat
- 4 tilda (UZ, RU, EN, TR) qo'shish/tahrirlash
- Modal oyna
- O'chirish

### 4. Products (/products)
- Card ko'rinishida ro'yxat
- 4 tilda ma'lumot
- 3 tagacha rasm URL
- Narx, chegirma, stock
- Kategoriya tanlash
- Featured va Active statuslar

## 🎨 Xususiyatlar

- **Professional UI**: Zamonaviy dizayn
- **Responsive**: Barcha ekranlarda ishlaydi
- **Redux State**: Samarali state management
- **Auto Token Refresh**: Token avtomatik yangilanadi
- **Modal Forms**: Chiroyli modal oynalar
- **Tabs**: 4 til uchun tablar
- **Loading States**: Yuklanish animatsiyalari
- **Error Handling**: Xatoliklarni ko'rsatish

## 📝 Foydalanish

### Kategoriya Qo'shish
1. "Kategoriyalar" ga o'ting
2. "Yangi Kategoriya" tugmasini bosing
3. 4 ta tilda nom va ta'rifni kiriting
4. "Yaratish" ni bosing

### Mahsulot Qo'shish
1. "Mahsulotlar" ga o'ting
2. "Yangi Mahsulot" tugmasini bosing
3. Kategoriya, narx, stock kiriting
4. 3 tagacha rasm URL kiriting
5. 4 ta tilda nom va ta'rifni kiriting
6. "Yaratish" ni bosing

## 🔧 Texnologiyalar

- Next.js 14 (App Router)
- Redux Toolkit
- Tailwind CSS
- TypeScript
- Lucide Icons

## 📦 To'liq Tayyor!

Barcha sahifalar ishlaydi, backend bilan to'liq ulangan!
