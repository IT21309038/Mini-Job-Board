Mini Job Board
A two-sided job board with Laravel 12.x (API + JWT) and Next.js (Pages Router + Tailwind).

Employer: post/manage jobs, view applicants, download resumes

Candidate: browse jobs, apply with PDF resume, see “My Applications”

This repo contains two apps:
/backend   # Laravel 12.x API (PHP 8.3, MySQL, JWT, Mail via Gmail SMTP)
/frontend  # Next.js + Tailwind (Pages Router), role-aware UI with custom auth wrapper

Tech stack
Backend

PHP 8.3 + Laravel 12.x

MySQL (Eloquent ORM)

JWT auth (Authorization: Bearer <token>)

File uploads (resumes) to local storage (storage/app/resumes/{userId}/...)

Gmail SMTP (app password) for mail

Frontend

Next.js (Pages Router) + Tailwind CSS

Axios with two instances (api, apiPrivate)

Cookie token via js-cookie + Authorization header via interceptor

Role-aware wrappers: AuthProvider and ProtectedRoute

Clean, responsive UI


Folder layout
/backend
  app/ ...
  database/ ...
  public/
  storage/
  Dockerfile
  composer.json
  .env.example

/frontend
  src/
    api/
    components/
    context/
    pages/
  public/
  Dockerfile
  package.json
  .env.example (create .env.local from this)


Local development (without Docker)
Backend (Laravel)
Prereqs: PHP 8.3, Composer, MySQL 8.x

cd backend
cp .env.example .env
//set DB_*, MAIL_* to your local values

composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

php artisan serve --host=127.0.0.1 --port=8000


Frontend (Next.js)
Prereqs: Node.js 20.x

cd frontend
cp .env.example .env.local
//Set this to your API base (Laravel dev server or Docker)
//NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

npm install
npm run dev
//open http://localhost:3000

API overview
Api Documentation=https://documenter.getpostman.com/view/26811673/2sB3BGGpGf

Find assets.zip for images of the system and postman collection


