# Nour Charity Backend API

جمعية نور الخيرية — Backend API & Database

## Tech Stack

- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens), bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS
- **File Upload**: Multer

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (running on `localhost:5432` or specified in `.env`)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure database
# Create or edit .env and set your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/nour_db?schema=public"

# 3. Run Prisma migration
npm run db:migrate

# 4. Seed the database
npm run db:seed

# 5. Start dev server
npm run dev
```

### Default Credentials

- **Admin**: `admin@nour.org` / `admin123`
- **Donor**: phone `01012345678` / OTP `123456`

## API Base URL

```
http://localhost:5000/api
```

## Project Structure

```
nour-backend/
├── prisma/
│   ├── schema.prisma    # Models and Enums
│   └── seed.js          # Demo data
├── src/
│   ├── app.js           # Express setup
│   ├── server.js        # Entry point
│   ├── config/          # Environment config
│   ├── lib/             # Prisma client, JWT utils
│   ├── middleware/      # Auth, validation, error handler
│   ├── shared/          # ApiError class
│   └── modules/         # Feature modules
│       ├── auth/          # Admin login, donor OTP
│       ├── programs/      # CRUD
│       ├── projects/      # CRUD + pagination
│       ├── donations/     # Create, list, stats
│       ├── payments/      # Simulated payment processing
│       ├── beneficiaries/ # CRUD + stats
│       ├── finance/       # Disbursement approval workflow
│       ├── dashboard/     # KPI aggregations
│       ├── reports/       # CRUD + quick stats
│       ├── notifications/ # CRUD
│       ├── volunteers/    # Public submit + admin list
│       ├── contact/       # Public submit + admin list
│       ├── settings/      # Org settings
│       ├── users/         # Admin user management
│       ├── account/       # Donor profile & history
│       ├── audit/         # System audit logs
│       └── reconciliation/# Financial reconciliation reports
└── .env                 # Environment variables
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Production start |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push Prisma schema changes |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:reset` | Reset DB & re-seed |

## Documentation

- `api_contract.md` — API Endpoints and their requests and responses.