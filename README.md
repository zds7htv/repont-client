# REPONT – Termékvisszavételi statisztikai rendszer

Ez a projekt egy **webes statisztikai felület**, amely segít a termék-visszavételek elemzésében és vizualizálásában.  
A rendszer két részből áll:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Laravel REST API

---

## Funkciók

- Szűrés dátum intervallum és gép szerint
- Termékek rangsorolása (mennyiség szerint)
- Oszlopdiagram megjelenítés
- Események listája (modal ablakban)
- Alapszintű bejelentkezés (admin/admin)

---

## Követelmények

- Node.js (v18+)
- PHP (8.1+) és Composer
- MySQL / SQLite adatbázis
- Git

---

## Telepítés

### 1. Klónozás

```bash
git clone https://github.com/zds7htv/repont-client.git
cd repont-client
```

### 2. Frontend (React)

```bash
cd repont-client
npm install
npm run dev
```

### 3. Backend (Laravel)

```bash
cd repont-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

## Bejelentkezés

A rendszer jelenleg egy **egyszerű bejelentkezést** tartalmaz:

- Felhasználónév: `admin`
- Jelszó: `admin`

> A bejelentkezés után a felhasználói állapot sessionStorage-ben kerül mentésre.

---

## Használat

1. Jelentkezz be a kezdőlapon.
2. Válassz dátumot és gépet.
3. Az oszlopdiagramon kattints egy termékre az események listázásához.

---

## Mappa struktúra

```
repont-client/
├── src/
│   ├── components/
│   ├── lib/
│   ├── App.tsx
│   ├── Login.tsx
│   └── ...
├── repont-api/
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── ...
├── public/
├── tailwind.config.js
├── postcss.config.cjs
└── README.md
```

---

## Készítette

**Zsiga Dániel**  
GitHub: [zds7htv](https://github.com/zds7htv)  
Email: zsigadani55@gmail.com

---

## Licenc

MIT – Szabadon használható, módosítható, terjeszthető.
