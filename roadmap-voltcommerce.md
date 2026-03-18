# Roadmap: VoltCommerce — E-commerce + Admin Dashboard

**Duración estimada:** 5 semanas (core) + 1 semana (extras)
**Dedicación:** ~4 horas/día
**Stack:** Angular · TypeScript · Java · Spring Boot · PostgreSQL · Docker · Tailwind CSS
**Extras incluidos:** Docker · Flyway · Tests (JUnit + Mockito + Jasmine/Karma) · Swagger · CI/CD con GitHub Actions

---

## Modelo de Datos (referencia rápida)

Antes de tocar código, ten este schema claro en la cabeza. Todo el proyecto gira alrededor de él.

```
User (id, email, password, name, role[ADMIN|CUSTOMER], createdAt)
Category (id, name, slug, description, imageUrl)
Product (id, name, slug, description, price, stock, imageUrl, categoryId, active, createdAt, updatedAt)
Cart (id, userId, createdAt, updatedAt)
CartItem (id, cartId, productId, quantity)
Order (id, userId, status[PENDING|PAID|SHIPPED|DELIVERED|CANCELLED], total, shippingAddress, stripePaymentId, createdAt, updatedAt)
OrderItem (id, orderId, productId, quantity, unitPrice)
```

> **Nota:** `unitPrice` en `OrderItem` guarda el precio al momento de compra. Esto es crítico: si el precio del producto cambia después, el historial de órdenes sigue siendo correcto.

---

## Semana 1 — Fundación: Docker, Auth, Modelo de Datos y Flyway

El objetivo de esta semana es tener el stack corriendo end-to-end con Docker, autenticación funcional, y el schema de base de datos gestionado por Flyway desde el día uno. Al final deberías poder hacer `docker compose up`, registrarse/loguearse, y confirmar que las tablas se crearon via las migraciones.

### Infraestructura Docker (hacer primero)

- [✅] Crear `docker-compose.yml` con 3 servicios:
  - `db`: PostgreSQL 15 con volumen persistente y healthcheck
  - `backend`: Spring Boot con Maven, montando `./backend` como volumen para hot reload (Spring DevTools)
  - `frontend`: Angular con Node 18, montando `./frontend` como volumen, exponiendo puerto 4200
- [✅] Crear `backend/Dockerfile` (dev): imagen con Maven + JDK 17, `ENTRYPOINT` que ejecuta `./mvnw spring-boot:run`
- [✅] Crear `frontend/Dockerfile` (dev): imagen con Node 18, instala Angular CLI, `ENTRYPOINT` que ejecuta `ng serve --host 0.0.0.0`
- [✅] Crear `.env.example` con variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [✅] Verificar hot reload en ambos servicios
- [✅] Configurar CI/CD con GitHub Actions desde el inicio:
  - Crear `.github/workflows/ci.yml`
  - Pipeline: checkout → build backend (Maven) → correr tests → build frontend → reportar resultado
  - Se ejecuta en cada push a `main` y en cada Pull Request

### Backend — Setup y Auth

- [✅] Inicializar proyecto con Spring Initializr: Web, Security, JPA, PostgreSQL, Validation, DevTools, Actuator
- [✅] Agregar dependencias adicionales en `pom.xml`:
  - `flyway-core` y `flyway-database-postgresql` para migraciones
  - `springdoc-openapi-starter-webmvc-ui` para Swagger
  - `stripe-java` para pagos
- [✅] Configurar `application.yml`:
  - DB apunta a `db:5432` (nombre del servicio Docker, no `localhost`)
  - Flyway habilitado: `spring.flyway.enabled=true`, `spring.flyway.locations=classpath:db/migration`
  - Deshabilitar `spring.jpa.hibernate.ddl-auto` (debe ser `none` — Flyway maneja el schema)
- [✅] Crear primera migración Flyway `V1__create_initial_schema.sql` en `resources/db/migration/`:
  - Tablas: `users`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_items`
  - Constraints de FK, índices en columnas de búsqueda frecuente (`slug`, `category_id`, `user_id`)
  - Incluir datos semilla para desarrollo (categorías y productos de electrónica de prueba)
- [✅] Crear entidades JPA mapeando el schema (sin dejar que Hibernate genere nada — Flyway ya lo hizo)
- [✅] Configurar Spring Security + JWT:
  - `JwtTokenProvider` (access token ~15min, refresh token ~7 días)
  - `JwtAuthenticationFilter`
  - `SecurityConfig`: públicos `/api/auth/**`, `/api/products/**` (GET), `/api/categories/**` (GET), `/v3/api-docs/**`, `/swagger-ui/**`; el resto protegido; rutas `/api/admin/**` requieren rol ADMIN
- [✅] Crear `AuthController`:
  - `POST /api/auth/register` — registro como CUSTOMER por defecto
  - `POST /api/auth/login` — retorna access + refresh token
  - `POST /api/auth/refresh` — renueva access token
- [✅] Configurar Swagger/OpenAPI:
  - Agregar anotación `@OpenAPIDefinition` con título "VoltCommerce API" y descripción
  - Configurar `SecurityScheme` para JWT Bearer en Swagger UI
  - Verificar que `http://localhost:8080/swagger-ui.html` carga correctamente
- [✅] Manejo global de excepciones con `@ControllerAdvice`
- [✅] **Tests — AuthService:**
  - `AuthServiceTest`: test de registro con email duplicado (debe lanzar excepción), test de login con credenciales incorrectas, test de generación y validación de token

### Frontend — Setup

- [✅] Crear proyecto Angular: `ng new voltcommerce --routing --style=scss --directory=.`
- [✅] Instalar y configurar Tailwind CSS (misma configuración que el Proyecto 1)
- [✅] Instalar `ngx-charts`: `npm install @swimlane/ngx-charts`
- [✅] Crear estructura de módulos:
  - `AuthModule` — login, register
  - `ShopModule` — catálogo, detalle de producto, carrito, checkout
  - `AdminModule` — dashboard, productos, categorías, órdenes
  - `CoreModule` — servicios compartidos, interceptors, guards
  - `SharedModule` — componentes reutilizables (botones, badges, spinners, toasts)
- [✅] Implementar `AuthService`: login, register, logout, refreshToken, isAuthenticated, getUserRole
- [✅] Crear `AuthInterceptor`: agrega Bearer token a requests; maneja refresh automático en 401
- [✅] Crear guards:
  - `AuthGuard` — redirige a login si no autenticado
  - `AdminGuard` — redirige a home si no es ADMIN
- [✅] Configurar rutas base con lazy loading:
  - `/` → ShopModule (público)
  - `/auth/login`, `/auth/register` → AuthModule
  - `/admin/**` → AdminModule (protegido con AdminGuard)
- [✅] Crear layouts: `ShopLayoutComponent` (header con carrito + navbar) y `AdminLayoutComponent` (sidebar)
- [✅] **Tests — AuthService:**
  - Test de `isAuthenticated()` con token válido vs expirado
  - Test de que `logout()` limpia localStorage

### Entregable de la semana
> `docker compose up` levanta todo el stack. Las migraciones de Flyway crean las tablas automáticamente. El registro y login funcionan. Swagger UI carga en `/swagger-ui.html`. CI/CD corre en GitHub Actions.

---

## Semana 2 — Catálogo de Productos y Carrito (Shop)

Esta semana construyes toda la experiencia del lado del cliente: navegar productos, filtrar, ver detalle, y gestionar el carrito. Al final, un usuario puede hacer todo el flujo de compra excepto el pago.

### Backend — Catálogo

- [✅] Configurar integración con Supabase Storage:
  - Crear bucket `product-images` en Supabase con acceso público
  - Agregar cliente HTTP en Spring para subir archivos a Supabase Storage REST API
  - Crear `StorageService` con método `uploadImage(MultipartFile file): String` que retorna la URL pública
- [✅] `CategoryController` + `CategoryService`:
  - `GET /api/categories` — listar todas las categorías activas
  - `GET /api/categories/{slug}` — detalle de una categoría
  - Documentar con anotaciones `@Operation` y `@ApiResponse` de Swagger
- [✅] `ProductController` + `ProductService`:
  - `GET /api/products` — listar productos con filtros y paginación server-side:
    - Query params: `?category=electronica&minPrice=100&maxPrice=500&search=laptop&sortBy=price&sortDir=asc&page=0&size=12`
    - Usar Spring Data Specifications para combinar filtros dinámicamente
  - `GET /api/products/{slug}` — detalle de producto
  - Documentar endpoints con Swagger
- [✅] Crear migración Flyway `V2__add_product_indexes.sql` con índices de búsqueda en `name` y `description` (full-text search básico con PostgreSQL `ILIKE`)
- [✅] **Tests — ProductService:**
  - Test de filtros: buscar por categoría retorna solo productos de esa categoría
  - Test de paginación: página 0 con size 12 retorna máximo 12 productos
  - Test de producto inactivo: no debe aparecer en listados públicos

### Backend — Carrito

- [✅] `CartController` + `CartService`:
  - `GET /api/cart` — obtener carrito del usuario autenticado (crea uno si no existe)
  - `POST /api/cart/items` — agregar producto al carrito (`{ productId, quantity }`)
  - `PUT /api/cart/items/{productId}` — actualizar cantidad de un item
  - `DELETE /api/cart/items/{productId}` — remover un item del carrito
  - `DELETE /api/cart` — vaciar carrito completo
- [✅] Validación de stock al agregar al carrito: si `quantity > product.stock`, retornar error 400
- [✅] Documentar endpoints del carrito con Swagger
- [✅] **Tests — CartService:**
  - Test de agregar producto que no existe (debe lanzar excepción)
  - Test de agregar más cantidad que el stock disponible
  - Test de que el carrito se crea automáticamente si no existe

### Frontend — Catálogo

- [✅] `ProductService` y `CategoryService` con HttpClient
- [✅] Página de catálogo (`/products`):
  - Grid de productos con cards (imagen de Supabase, nombre, precio, badge de categoría)
  - Sidebar de filtros: por categoría (checkboxes), rango de precio (inputs), ordenar por
  - Paginación con botones Previous/Next o número de páginas
  - Barra de búsqueda con debounce de 300ms
  - Estado vacío si no hay resultados
  - Skeleton loaders mientras cargan los productos
- [✅] Página de detalle de producto (`/products/:slug`):
  - Imagen grande, nombre, precio, descripción, stock disponible
  - Selector de cantidad (respeta stock máximo)
  - Botón "Add to Cart" (deshabilitado si stock = 0)
  - Breadcrumb: Home > Categoría > Nombre del producto
- [✅] **Tests — ProductService:**
  - Test de que los query params se construyen correctamente al filtrar

### Frontend — Carrito

- [✅] `CartService` con HttpClient + estado local del carrito en un BehaviorSubject
- [✅] Ícono de carrito en el header con badge mostrando cantidad de items (reactivo via BehaviorSubject)
- [✅] Sidebar/drawer del carrito (se abre desde el header):
  - Lista de items con imagen, nombre, precio, cantidad, subtotal por item
  - Botones para aumentar/disminuir cantidad o eliminar item
  - Total del carrito al fondo
  - Botón "Checkout"
- [✅] **Tests — CartService:**
  - Test de que el badge del header se actualiza al agregar un item

### Entregable de la semana
> Un usuario puede navegar el catálogo, filtrar productos, ver el detalle, agregar al carrito y modificar cantidades. La paginación y los filtros funcionan server-side.

---

## Semana 3 — Checkout con Stripe y Gestión de Órdenes

Esta semana integras el pago real con Stripe y construyes el flujo de órdenes completo.

### Backend — Checkout y Stripe

- [✅] Configurar Stripe en Spring Boot:
  - `StripeConfig`: inicializar `Stripe.apiKey` con la variable de entorno
  - Agregar dependencia `stripe-java` si no está ya en `pom.xml`
- [✅] `OrderController` + `OrderService`:
  - `POST /api/orders/checkout` — crear una orden a partir del carrito actual:
    1. Validar que todos los productos siguen teniendo stock suficiente
    2. Crear registro de `Order` con status `PENDING`
    3. Crear `OrderItems` capturando el `unitPrice` actual de cada producto
    4. Descontar stock de cada producto
    5. Crear un `PaymentIntent` de Stripe con el total en centavos
    6. Retornar el `client_secret` del PaymentIntent al frontend
    7. Vaciar el carrito
  - `GET /api/orders` — listar órdenes del usuario autenticado (con paginación)
  - `GET /api/orders/{id}` — detalle de una orden
- [✅] `POST /api/webhooks/stripe` — endpoint para recibir eventos de Stripe:
  - Verificar firma del webhook con `STRIPE_WEBHOOK_SECRET`
  - Evento `payment_intent.succeeded` → cambiar orden a `PAID`
  - Evento `payment_intent.payment_failed` → cambiar orden a `CANCELLED` y restaurar stock
- [✅] Crear migración Flyway `V3__add_order_indexes.sql`: índice en `orders.user_id` y `orders.status`
- [✅] Documentar endpoints de órdenes con Swagger
- [✅] **Tests — OrderService:**
  - Test de checkout con stock insuficiente (debe lanzar excepción y no crear la orden)
  - Test de que `unitPrice` en `OrderItem` es el precio del momento, no el actual
  - Test de webhook: evento `payment_intent.succeeded` cambia status a `PAID`

### Frontend — Checkout

- [✅] Instalar Stripe.js: `npm install @stripe/stripe-js`
- [✅] Página de checkout (`/checkout`):
  - Resumen del pedido (items, subtotal, total)
  - Formulario de dirección de envío (nombre, dirección, ciudad, país, código postal)
  - Formulario de pago con Stripe Elements (`CardElement`) — manejo nativo de Stripe para datos de tarjeta
  - Al confirmar: llamar a `/api/orders/checkout`, recibir `client_secret`, confirmar pago con `stripe.confirmCardPayment()`
  - Redireccionar a página de éxito o mostrar error
- [✅] Página de éxito (`/checkout/success`):
  - Mensaje de confirmación con número de orden
  - Resumen del pedido
  - Botón "Continue Shopping"
- [✅] Página "Mis Órdenes" (`/orders`):
  - Lista de órdenes del usuario con: número, fecha, total, status (badge de color)
  - Click en una orden abre el detalle
- [✅] Página de detalle de orden (`/orders/:id`):
  - Items comprados, precios, subtotal, total
  - Status actual con timeline visual (PENDING → PAID → SHIPPED → DELIVERED)
  - Dirección de envío
- [✅] **Tests — CheckoutComponent:**
  - Test de que no se puede acceder a `/checkout` sin items en el carrito

### Entregable de la semana
> El flujo de compra completo funciona: agregar al carrito → checkout → pago con Stripe (modo test) → confirmación de orden. Los webhooks actualizan el status automáticamente.

---

## Semana 4 — Panel Admin: Productos, Categorías e Inventario

Esta semana construyes la otra cara del proyecto: el admin dashboard. Es donde un reclutador ve que sabes manejar roles, autorización y UX más compleja.

### Backend — Admin APIs

- [✅] `AdminProductController` (ruta base `/api/admin/products`, requiere rol ADMIN):
  - `GET /api/admin/products` — listar todos los productos (incluyendo inactivos) con paginación
  - `POST /api/admin/products` — crear producto (JSON con imageUrl)
  - `PUT /api/admin/products/{id}` — editar producto
  - `PATCH /api/admin/products/{id}/toggle` — activar/desactivar producto (no borrar)
  - `DELETE /api/admin/products/{id}` — eliminar producto (solo si no tiene órdenes asociadas)
- [✅] `AdminCategoryController` (ruta base `/api/admin/categories`, requiere rol ADMIN):
  - CRUD completo de categorías con imageUrl
- [✅] `AdminOrderController` (ruta base `/api/admin/orders`, requiere rol ADMIN):
  - `GET /api/admin/orders` — listar todas las órdenes con filtros: `?status=PAID&from=2024-01-01&to=2024-12-31&page=0&size=20`
  - `PATCH /api/admin/orders/{id}/status` — cambiar status de una orden (`{ status: "SHIPPED" }`)
- [✅] `AdminDashboardController`:
  - `GET /api/admin/dashboard/stats` — estadísticas para las tarjetas y gráficos:
    - Ventas totales del mes actual vs mes anterior
    - Cantidad de órdenes por status
    - Top 5 productos más vendidos (por cantidad)
    - Ventas por día de los últimos 30 días (para gráfico de línea)
    - Productos con stock bajo (< 10 unidades)
  - Usar `@Query` con JPQL y JpaSpecificationExecutor para agregar datos eficientemente
- [✅] Documentar todos los endpoints admin con Swagger incluyendo @Operation y @ApiResponse
- [✅] **Tests — AdminProductService:**
  - Test de que eliminar un producto con órdenes asociadas lanza excepción
  - Test de que desactivar un producto lo oculta del catálogo público

### Frontend — Admin Panel

- [✅] Módulo Admin con layout propio: sidebar con links a secciones y header con nombre del admin
- [✅] **Dashboard Admin** (`/admin`):
  - 4 tarjetas de KPIs: Ventas del mes, Órdenes totales, Productos activos, Clientes registrados
  - Gráfico de línea con ngx-charts: ventas por día de los últimos 30 días
  - Gráfico de dona con ngx-charts: distribución de órdenes por status
  - Tabla de productos con stock bajo (alerta visual)
  - Top 5 productos más vendidos
- [✅] **Gestión de Productos** (`/admin/products`):
  - Tabla con paginación server-side: imagen (thumbnail), nombre, categoría, precio, stock, status activo/inactivo
  - Filtros: por categoría, por estado activo, búsqueda por nombre
  - Botón "New Product" → abre formulario en modal
  - Acciones por fila: editar, toggle activo/inactivo, eliminar (con confirmación)
- [✅] **Formulario de Producto** (modal):
  - Campos: nombre, slug, descripción, precio, stock, categoría (select), activo (toggle)
  - Image URL field (input de texto para URL de imagen)
  - Validaciones con Reactive Forms
- [✅] **Gestión de Categorías** (`/admin/categories`):
  - Tabla simple: imagen, nombre, slug, descripción
  - CRUD completo con modal de formulario
- [✅] **Gestión de Órdenes** (`/admin/orders`):
  - Tabla con filtros por status y rango de fechas
  - Columnas: número de orden, fecha, total, dirección, status (badge de color)
  - Dropdown por fila para cambiar status
- [✅] **Tests — AdminDashboardComponent:**
  - Test de que ngx-charts recibe el formato de datos correcto del servicio

### Entregable de la semana
> El panel admin está completo. Un ADMIN puede gestionar productos (con imágenes en Supabase), categorías, y órdenes. El dashboard muestra métricas reales con gráficos de ngx-charts.

---

## Semana 5 — Deploy, CI/CD Completo y README

La semana final es para dejar todo production-ready, con CI/CD funcionando y documentación profesional.

### Backend — Preparar para producción

- [✅] Crear `application-dev.yml` y `application-prod.yml` con perfiles separados
- [✅] Crear `backend/Dockerfile.prod` (multi-stage: build con Maven → run con JRE slim)
- [✅] Verificar que Flyway corre las migraciones también en el entorno de producción (Render crea la DB vacía, Flyway crea las tablas)
- [✅] Verificar configuración de Stripe Webhook para la URL de producción
- [✅] Revisar y limpiar logs: no loggear tokens, passwords, ni el Stripe secret
- [✅] Confirmar que `/actuator/health` responde correctamente

### Frontend — Build y optimización

- [✅] Configurar build de producción para deploy estático en Netlify
- [✅] Crear `frontend/netlify.toml` con configuración de build y redirects para SPA routing
- [✅] Verificar que `environment.prod.ts` apunta a la URL de producción del backend en Render y tiene la clave pública de Stripe
- [✅] Confirmar que todos los módulos tienen lazy loading configurado

### CI/CD — GitHub Actions completo

- [✅] Actualizar `.github/workflows/ci.yml` para el pipeline completo:
  - **Build & Test** (en cada push y PR): checkout → tests backend con Maven → tests frontend con Vitest
  - **Deploy** (solo en push a `main` con tests pasando):
    - Deploy backend a Render (auto-deploy desde GitHub o Render Deploy Hook)
    - Deploy frontend a Netlify (auto-deploy desde GitHub o Netlify CLI)
- [✅] Agregar badges de CI al README: `[![CI](https://github.com/...)]`

### Deploy

- [ ] Backend: deploy a Render
  - Usar `Dockerfile.prod` como Web Service en Render
  - Usar PostgreSQL del proyecto Supabase "trackr" con schema `voltcommerce` (Flyway crea el schema y tablas automáticamente al iniciar)
  - Setear todas las variables de entorno: DATABASE_URL (Supabase pooler), JWT, Stripe, Supabase, CORS_ALLOWED_ORIGINS
  - Configurar Stripe Webhook apuntando a la URL de Render
  - Verificar `/actuator/health` y `/swagger-ui.html` en producción
- [ ] Frontend: deploy a Netlify
  - Conectar repo de GitHub, configurar build command (`npm run build`) y publish directory (`dist/voltcommerce/browser`)
  - Configurar redirects para SPA routing (`/* → /index.html 200`)
  - Verificar que las llamadas a la API de Render funcionan (configurar `_redirects` o `netlify.toml` para proxy si es necesario)
- [ ] Probar flujo completo en producción con una tarjeta de prueba de Stripe (`4242 4242 4242 4242`)

### Documentación

- [ ] README.md completo en inglés:
  - Descripción del proyecto + screenshot del catálogo + screenshot del dashboard admin
  - Stack tecnológico
  - Diagrama de arquitectura: Browser → Angular (Netlify) → Spring Boot (Render) → PostgreSQL + Supabase Storage + Stripe
  - Link al demo en vivo + credenciales de demo (un usuario customer y un admin de prueba)
  - Instrucciones para correr localmente: prerequisites, `cp .env.example .env`, `docker compose up`
  - Instrucciones para probar pagos: tarjetas de prueba de Stripe
  - Decisiones técnicas: por qué Flyway, por qué guardar `unitPrice` en `OrderItem`, cómo funciona el webhook de Stripe
- [ ] Limpiar código: eliminar console.logs, comentarios TODO, código muerto
- [ ] Crear usuario ADMIN de demo con datos de prueba vía Flyway (`V4__seed_demo_data.sql`)

### Entregable de la semana
> App deployada con URL pública, CI/CD verde en GitHub, Swagger documentado, README profesional con screenshots. Lista para poner en el CV.

---

## Resumen Visual

| Semana | Foco | Resultado |
|--------|------|-----------|
| 1 | Docker + Auth + Flyway + Swagger + CI base | Stack corriendo, auth E2E, schema migrado, Swagger UI |
| 2 | Catálogo + Carrito (Shop) | Navegar, filtrar, agregar al carrito |
| 3 | Checkout + Stripe + Órdenes | Flujo de compra completo con pago real |
| 4 | Panel Admin + Dashboard + ngx-charts | CRUD admin, métricas, gráficos, gestión de órdenes |
| 5 | Deploy + CI/CD completo + README | URL pública, GitHub Actions verde, docs profesional |

---

## Tips Generales

**Sobre Flyway:** Nunca edites una migración ya ejecutada. Si cometiste un error, crea una nueva migración que lo corrija (`V2__fix_...`). Flyway compara checksums y fallará si detecta que una migración ya aplicada fue modificada.

**Sobre Stripe en desarrollo:** Usa `stripe listen --forward-to localhost:8080/api/webhooks/stripe` para probar webhooks localmente. Sin esto, el status de las órdenes nunca pasará de PENDING en tu entorno local.

**Sobre imágenes y Supabase:** El bucket `product-images` debe ser público para que las URLs funcionen directamente en `<img>` tags. Configúralo como público en el dashboard de Supabase desde el inicio.

**Sobre el orden de trabajo diario:** Implementa backend → escribe el test del backend → verifica con Swagger UI → construye el frontend. Swagger te ahorra tener que abrir Postman para probar cada endpoint nuevo.

**Sobre el panel admin vs la tienda:** Son dos mundos distintos con layouts y guards distintos. Mantén sus módulos completamente separados. Si mezclas rutas o componentes entre ShopModule y AdminModule, el proyecto se vuelve difícil de mantener rápidamente.

**Sobre scope creep:** Si el checkout con Stripe se complica, simplifica: en vez de Stripe Elements embebido, puedes usar Stripe Checkout (redirecciona a una página de Stripe) que es mucho más simple de integrar. El resultado es menos pulido visualmente pero funciona igual de bien para el portafolio.

**Sobre Git:** Usa ramas por feature (`feat/product-catalog`, `feat/stripe-checkout`, `feat/admin-dashboard`). Con CI/CD configurado, cada PR verá automáticamente si los tests pasan antes de mergear.
