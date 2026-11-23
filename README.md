# ✈ SkyPort — Airport Ticket Management System (MERN)

**M**ongoDB · **E**xpress · **R**eact (Vite) · **N**ode.js

## Features
- Search flights by city/code and date, with sort, airline and max-price filters
- Live departure board on the home page (gate, terminal, status)
- Interactive seat map (Business rows 1–4 cost 2.2×, Economy rows 5–20)
- Multi-passenger booking (up to 6) with atomic seat locking — no double bookings
- Auto-generated PNR + printable boarding pass with barcode
- Cancel booking with 90% refund (seats are released automatically)
- JWT authentication (register / login), protected routes
- Admin control tower: stats, add/delete flights, change flight status, view all bookings

## Folder structure
```
skyport/
├── README.md
├── server/                 # Node + Express + MongoDB API
│   ├── package.json
│   ├── .env.example        # copy to .env
│   ├── server.js
│   ├── seed.js
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── utils/helpers.js
│   ├── models/{User,Flight,Booking}.js
│   ├── controllers/{authController,flightController,bookingController}.js
│   └── routes/{auth,flights,bookings}.js
└── client/                 # React (Vite)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── utils.js
        ├── index.css
        ├── context/AuthContext.jsx
        ├── components/{Navbar,FlightCard,SeatMap,BoardingPass}.jsx
        └── pages/{Home,Flights,Book,MyBookings,Auth,Admin}.jsx
```

## Run it
Requires Node 18+ and MongoDB (local or Atlas).

```bash
# 1) Backend
cd server
npm install
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
npm run seed                # creates demo flights + users
npm run dev                 # http://localhost:5000

# 2) Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Demo logins
- Traveler: `user@skyport.com` / `user123`
- Admin: `admin@skyport.com` / `admin123`

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | user |
| GET | /api/flights?from=&to=&date= | public |
| GET | /api/flights/:id | public |
| POST / PATCH status / DELETE | /api/flights | admin |
| POST | /api/bookings | user |
| GET | /api/bookings/mine | user |
| PATCH | /api/bookings/:id/cancel | owner/admin |
| GET | /api/bookings/admin/all, /admin/stats | admin |
