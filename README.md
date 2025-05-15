# REPONT – Flakonvisszavételi statisztikai rendszer

Ez a projekt egy **webes statisztikai felület**, amely segít a flakon-visszavételek elemzésében és vizualizálásában.  
A rendszer két részből áll:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS  
- **Backend**: Laravel REST API

---

## Újdonságok a legutóbbi frissítésben

- **`event_type` szűrési lehetőség hozzáadva** frontend és backend oldalon is.
- **Halmozott oszlopdiagram** és részletes eseménylista fejlesztve.
- **EventsModal módosítás**: már háttérkattintással is zárható.
- **Új log feltöltő funkció frontendről** (UploadLog.tsx):
  - Csak `.log` kiterjesztés engedélyezett.
  - A fájl tartalma JSON-ként validálásra kerül frontend oldalon.
  - Érvényes fájl backendre kerül mentésre, és az összes cache automatikusan törlődik.
- **Watcher (watcher.py)** már háttérszolgáltatásként (service) fut és **valós időben** dolgozza fel a temp mappába érkező logokat.
- **.gitignore frissítve**, hogy ne kerüljenek felesleges fájlok verziókezelésbe.

---

## Funkciók

- Szűrés dátum, gép és eseménytípus (`event_type`) szerint  
- Flakonok rangsorolása (mennyiség szerint)  
- Halmozott oszlopdiagram megjelenítés  
- Események listája (modal ablakban, dinamikusan tölthető)  
- Frontendről történő logfájl-feltöltés validációval és visszajelzéssel  
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
2. Ezután meg kell adnod a **Google Authenticator** által generált 6 jegyű kódot.

**Teszteléshez használható Google Auth kulcs:**

```
RDPE4QK6ZYRCZORY
```

---

## API végpontok

### GET `/api/leaderboard`  
Visszaadja az összesített statisztikát dátum, gép és eseménytípus (`event_type`) szerint.

### GET `/api/events`  
Termékhez tartozó események listázása gép, dátum és eseménytípus (`event_type`) szerint.

### GET `/api/machines`  
Visszaadja az elérhető gépeket.

### GET `/api/daterange`  
Visszaadja a legkorábbi és legkésőbbi esemény dátumot.

### POST `/api/login`  
Bejelentkezés felhasználónév és jelszó alapján.  
Ha az első lépés sikeres, válaszban szerepel `requires_totp: true`.

```json
{ "name": "admin", "password": "admin" }
```

### POST `/api/verify-totp`  
Google Auth OTP kód ellenőrzése.

```json
{ "name": "admin", "code": "123456" }
```

### POST `/api/upload-log`  
Új logfájl feltöltése frontendről (csak `.log`, JSON tartalom).  
Feltöltés után a fájl a `repont-logupload/update/temp` mappába kerül, majd cache ürítés történik.

---

## Használat

1. Jelentkezz be a kezdőlapon.  
2. Add meg a Google Authenticator által generált kódot.  
3. Válassz dátumot, gépet és eseménytípust.  
4. Az oszlopdiagramon kattints egy flakonra az események listázásához.
5. A feltöltő gomb segítségével új logokat tölthetsz fel valós idejű megjelenítéssel.

---

## Mappa struktúra

```
repont-client/
├── src/
│   ├── components/
│   ├── lib/
│   ├── App.tsx
│   ├── Login.tsx
│   ├── UploadLog.tsx
│   └── ...
├── repont-api/
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── ...
├── repont-logupload/
│   ├── watcher.py
│   ├── update/
│   └── ...
├── public/
└── README.md
```

---

## Valós idejű log feldolgozó rendszer (watcher)

A projekt tartalmaz egy **valós idejű fájlfigyelő modult** is (`repont-logupload` mappában), amely automatikusan felismeri és feldolgozza a feltöltött logfájlokat, majd a megfelelő adatbázis-táblába menti azokat.

### Főbb jellemzők

- Figyeli a `temp` mappát, és az ott megjelenő `.log` kiterjesztésű JSON fájlokat dolgozza fel.
- Automatikus struktúrafelismerés alapján eldönti, hogy a `products` vagy `recycling` táblába tartozik az adat.
- Érvényes szerkezet esetén:
  - Betölti az adatokat a MariaDB `repont` adatbázisba.
  - Átmozgatja a fájlt a `products` vagy `recycling` mappába.
  - Új fájlnév kerül generálásra: `0001_20250514T213012.log` (sorszám + dátum/idő).
- Hibás JSON vagy ismeretlen struktúra esetén a fájl nem kerül feldolgozásra.

### Könyvtárstruktúra

```
repont-logupload/
├── watcher.py             # A fájlfigyelő és feldolgozó logika
├── config.py              # Az adatbázis csatlakozási adatai (nincs verziókövetve)
├── update/
│   ├── temp/              # Ide kerülnek a feltöltött fájlok (figyelt mappa)
│   ├── products/          # Ide kerülnek az érvényes termék adatok
│   └── recycling/         # Ide kerülnek az érvényes visszavételi események
├── samples/               # Minta fájlok termék és esemény formátumokhoz
├── .gitignore             # Kizárja a `venv/`, `config.py` és más érzékeny fájlokat
```

### Watcher elindítása

```bash
cd repont-logupload
source venv/bin/activate     # Virtuális környezet aktiválása
python watcher.py            # Watcher futtatása
```

---

## JSON mintaformátumok

A watcher csak akkor dolgozza fel a fájlokat, ha azok helyes JSON formátumban és a megfelelő kulcsokkal kerülnek be a `temp` mappába.

### 1. Termékadatok (`products` tábla)

```json
[
  {
    "type_number": "X654",
    "product_name": "RedBull"
  },
  {
    "type_number": "Y987",
    "product_name": "Hell Classic"
  }
]
```

- **Kulcsok pontosan:** `type_number`, `product_name`  
- A fájl a `products` mappába kerül, és az adatok a `products` táblába íródnak.

---

### 2. Visszavételi események (`recycling` tábla)

```json
[
  {
    "machine_id": 1,
    "product": 11,
    "event_type": "success",
    "event_date": "2025-05-14 21:26:00",
    "created_at": "2025-05-14 21:26:05",
    "updated_at": "2025-05-14 21:26:05"
  }
]
```

- **Kulcsok pontosan:** `machine_id`, `product`, `event_type`, `event_date`, `created_at`, `updated_at`  
- A fájl a `recycling` mappába kerül, és az adatok a `recycling` táblába íródnak.

---

## Készítette

**Zsiga Dániel**  
GitHub: [zds7htv](https://github.com/zds7htv)  
Email: zsigadani55@gmail.com

---

## Licenc

MIT – Szabadon használható, módosítható, terjeszthető.