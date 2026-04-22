# Backend Setup

## Environment

Create `backend/.env` from `backend/.env.example`.

Required for password reset email:

```env
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=TechShop <your_email@gmail.com>
```

## Gmail note

If you use Gmail, `SMTP_PASS` must be an App Password, not your normal account password.

## Install

```bash
cd backend
npm install
```

## Migrate

Password reset requires the new migration:

```bash
npx sequelize-cli db:migrate
```

## Run

```bash
npm start
```

If SMTP is not configured and `NODE_ENV` is not `production`, the forgot-password flow will show the reset link directly in the UI for local testing.
