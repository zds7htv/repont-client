
# REPONT – Flakonvisszavételi statisztikai rendszer

Ez a projekt egy **webes statisztikai felület**, amely segít a flakon-visszavételek elemzésében és vizualizálásában.  
A rendszer két részből áll:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Laravel REST API

---

## Funkciók

- Szűrés dátum intervallum és gép szerint
- Flakonok rangsorolása (mennyiség szerint)
- Oszlopdiagram megjelenítés
- Események listája (modal ablakban)
- **Kétlépcsős bejelentkezés (felhasználónév + Google Authenticator OTP)**

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

A rendszer **kétlépcsős azonosítást** használ:

1. Írd be a felhasználónevet és jelszót:
   - Felhasználónév: `admin`  
   - Jelszó: `admin`

2. Ezután meg kell adnod a **Google Authenticator** alkalmazás által generált 6 jegyű kódot.

**Teszteléshez használható Google Auth kulcs:**

```
RDPE4QK6ZYRCZORY
```

> Regisztráld be Google Authenticator alkalmazásba manuálisan, vagy generálj hozzá QR kódot.

---

## API végpontok

A backend a következő API-kat biztosítja:

### GET `/api/leaderboard`

Visszaadja az összesített statisztikát dátum és gép szerint.

### GET `/api/events`

Termékhez tartozó események listázása.

### GET `/api/machines`

Visszaadja az elérhető gépeket.

### GET `/api/daterange`

Visszaadja a legkorábbi és legkésőbbi esemény dátumot.

### POST `/api/login`

Bejelentkezés felhasználónév és jelszó alapján.  
Ha az első lépés sikeres, válaszban szerepel `requires_totp: true`.

**Body példa:**
```json
{ "name": "admin", "password": "admin" }
```

### POST `/api/verify-totp`

Google Auth OTP kód ellenőrzése.

**Body példa:**
```json
{ "name": "admin", "code": "123456" }
```

---

## Használat

1. Jelentkezz be a kezdőlapon.
2. Add meg a Google Authenticator által generált kódot.
3. Válassz dátumot és gépet.
4. Az oszlopdiagramon kattints egy flakonra az események listázásához.

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

