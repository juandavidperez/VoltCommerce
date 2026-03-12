# VoltCommerce

> Full-stack e-commerce app for electronics. REST API with Spring Boot, Angular storefront, Stripe payments, admin dashboard with ngx-charts, Dockerized with Flyway migrations.

[![CI](https://github.com/juandavidperez/voltcommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/juandavidperez/voltcommerce/actions/workflows/ci.yml)
![Java](https://img.shields.io/badge/Java_17-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat&logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular_19-DD0031?style=flat&logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## Live Demo

🌐 **Storefront:** `https://voltcommerce.vercel.app` *(coming soon)*
⚙️ **API Docs (Swagger):** `https://voltcommerce-api.railway.app/swagger-ui.html` *(coming soon)*

**Demo credentials:**

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@demo.com` | `demo1234` |
| Admin | `admin@demo.com` | `admin1234` |

**Test card for Stripe:** `4242 4242 4242 4242` · Any future date · Any CVC

---

## Screenshots

> *(Screenshots will be added once the project is deployed)*

| Storefront | Product Detail | Checkout |
|------------|---------------|----------|
| ![storefront](#) | ![product](#) | ![checkout](#) |

| Admin Dashboard | Product Management | Order Management |
|-----------------|--------------------|-----------------|
| ![dashboard](#) | ![products](#) | ![orders](#) |

---

## Features

### Storefront (Customer)
- Product catalog with server-side filtering by category, price range, and search
- Paginated product grid with skeleton loaders
- Product detail page with stock validation
- Persistent shopping cart with real-time item count badge
- Full checkout flow with Stripe Elements (credit card payments)
- Order history with status tracking timeline (PENDING → PAID → SHIPPED → DELIVERED)

### Admin Dashboard
- KPI cards: monthly revenue, total orders, active products, registered customers
- Sales chart (last 30 days) and order distribution chart — powered by ngx-charts
- Product management: create, edit, activate/deactivate, delete with image upload to Supabase Storage
- Category management with CRUD
- Order management: filter by status/date, update order status
- Low stock alerts

### Technical
- JWT authentication with access + refresh token rotation
- Role-based access control (CUSTOMER / ADMIN) enforced at the API level
- Database schema managed entirely with Flyway migrations (no Hibernate DDL)
- Stripe Webhook integration for automatic order status updates
- Swagger/OpenAPI documentation for all endpoints
- Dockerized development environment with hot reload
- CI/CD with GitHub Actions (build + test on every push and PR)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19 · TypeScript · Tailwind CSS · ngx-charts · Stripe.js |
| Backend | Java 17 · Spring Boot 3 · Spring Security · Spring Data JPA |
| Database | PostgreSQL 15 · Flyway (migrations) · Hibernate |
| Payments | Stripe (PaymentIntents + Webhooks) |
| Storage | Supabase Storage (product images) |
| DevOps | Docker · Docker Compose · GitHub Actions |
| Testing | JUnit 5 · Mockito · Jasmine · Karma |
| Docs | Swagger UI / springdoc-openapi |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│              Angular SPA (Vercel)                       │
│   ShopModule · AdminModule · AuthModule · CoreModule    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│                   Spring Boot API                       │
│                  (Railway / Docker)                     │
│  AuthController · ProductController · CartController   │
│  OrderController · AdminController · WebhookController │
│         Spring Security (JWT) · Swagger UI             │
└──────┬─────────────────┬──────────────────┬────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ PostgreSQL  │  │   Supabase   │  │    Stripe    │
│  (Railway)  │  │   Storage    │  │  Payments +  │
│   Flyway    │  │   (Images)   │  │   Webhooks   │
└─────────────┘  └──────────────┘  └──────────────┘
```

---

## Database Schema

```
users ──────────────────────────────────────────────────┐
  id, email, password, name, role, createdAt             │
                                                         │
categories          products                             │
  id, name, slug  ←── id, name, slug, description,      │
  description,        price, stock, imageUrl,            │
  imageUrl            categoryId, active                 │
                                                         │
carts ──────────── cart_items                            │
  id, userId  ←──── id, cartId, productId, quantity     │
                                                         │
orders ─────────── order_items                           │
  id, userId,  ←──── id, orderId, productId,            │
  status, total,      quantity, unitPrice ◄── snapshot  │
  shippingAddress,                             at time   │
  stripePaymentId                              of sale   │
```

> **Key design decision:** `unitPrice` in `order_items` captures the product price at the time of purchase. This ensures order history remains accurate even if prices change later.

---

## Project Structure

```
voltcommerce/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/voltcommerce/
│   │   │   │   ├── auth/          # JWT, Spring Security config
│   │   │   │   ├── product/       # Product + Category domain
│   │   │   │   ├── cart/          # Cart domain
│   │   │   │   ├── order/         # Order + Stripe integration
│   │   │   │   ├── admin/         # Admin-only controllers
│   │   │   │   ├── storage/       # Supabase Storage service
│   │   │   │   └── common/        # DTOs, exceptions, config
│   │   │   └── resources/
│   │   │       ├── db/migration/  # Flyway migrations (V1__, V2__...)
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── application-prod.yml
│   │   └── test/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── shop/              # Catalog, Product detail, Cart, Checkout
│   │   │   ├── admin/             # Dashboard, Products, Categories, Orders
│   │   │   ├── core/              # Services, interceptors, guards
│   │   │   └── shared/            # Reusable components
│   │   └── environments/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── nginx.conf
│
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Git](https://git-scm.com/)
- A [Stripe](https://stripe.com) account (free, test mode is enough)
- A [Supabase](https://supabase.com) project with a public `product-images` bucket

### 1. Clone the repository

```bash
git clone https://github.com/juandavidperez/voltcommerce.git
cd voltcommerce
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Database
POSTGRES_DB=voltcommerce
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Start the full stack

```bash
docker compose up
```

This starts three services:
- **PostgreSQL** on port `5432` — Flyway runs migrations automatically on startup
- **Spring Boot API** on port `8080` — with hot reload via Spring DevTools
- **Angular** on port `4200` — with hot reload

### 4. Set up Stripe webhooks (for local development)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```

Copy the webhook signing secret it prints and update `STRIPE_WEBHOOK_SECRET` in your `.env`.

### 5. Open the app

| Service | URL |
|---------|-----|
| Storefront | http://localhost:4200 |
| Admin Panel | http://localhost:4200/admin |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Health | http://localhost:8080/actuator/health |

> The database is seeded with demo categories, products, and an admin user on first run. See `V1__create_initial_schema.sql` for details.

---

## Running Tests

**Backend:**
```bash
docker compose exec backend ./mvnw test
```

**Frontend:**
```bash
docker compose exec frontend ng test --watch=false --browsers=ChromeHeadless
```

---

## Key Technical Decisions

**Flyway over Hibernate DDL** — Using `spring.jpa.hibernate.ddl-auto=none` and managing all schema changes through versioned Flyway migrations gives full control over the database schema and a clear audit trail of every change.

**unitPrice snapshot in order_items** — Each `OrderItem` stores the product price at the time of purchase rather than referencing the current product price. This ensures order history stays accurate even when prices are updated later.

**Stripe Webhook for order status** — Instead of marking an order as PAID immediately after the frontend confirms the payment, the backend waits for the `payment_intent.succeeded` webhook event. This is the correct approach because it handles edge cases like network failures between the frontend confirmation and the backend.

**Spring Data Specifications for filtering** — Product filtering uses the Specification pattern instead of hardcoded JPQL queries, making it easy to combine filters dynamically without writing a new query for every combination.

**Role-based route guarding on both sides** — Admin routes are protected by `AdminGuard` on the frontend and by `@PreAuthorize("hasRole('ADMIN')")` on the backend. Security is never delegated only to the frontend.

---

## API Reference

Full API documentation is available at `/swagger-ui.html` when the backend is running.

Key endpoint groups:

| Group | Base Path | Auth Required |
|-------|-----------|---------------|
| Auth | `/api/auth` | No |
| Products | `/api/products` | No (GET) |
| Categories | `/api/categories` | No (GET) |
| Cart | `/api/cart` | Customer |
| Orders | `/api/orders` | Customer |
| Admin | `/api/admin/**` | Admin only |
| Webhooks | `/api/webhooks/stripe` | Stripe signature |

---

## Deployment

The production setup uses multi-stage Docker builds to minimize image size.

**Backend → Railway**
```bash
# Railway detects Dockerfile.prod automatically
# Set all environment variables in Railway dashboard
```

**Frontend → Vercel**
```bash
# Connect the GitHub repo in Vercel dashboard
# Set VITE_API_URL to your Railway backend URL
```

**CI/CD** — GitHub Actions runs the full test suite on every push and PR, and deploys to production automatically when tests pass on `main`.

---

## Author

**Juan David Perez Vergara** — Fullstack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/juandpv/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/juandavidperez)

Medellín, Colombia
