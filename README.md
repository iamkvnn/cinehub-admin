# CineHub Admin API

Backend RESTful API cho hệ thống quản trị CineHub (Dashboard Admin), được xây dựng bằng **Express.js** và **TypeORM**.

## 🚀 Tính năng chính

- **Dashboard Statistics**: Thống kê tổng quan người dùng, phim, doanh thu, lượt xem.
- **Authentication**: JWT-based authentication cho admin.
- **TypeORM**: Quản lý database với MySQL.
- **Swagger Documentation**: API docs tự động tại `/api-docs`.
- **Role-based Access Control**: Phân quyền theo vai trò (ADMIN, USER).

## 🛠 Yêu cầu hệ thống

- Node.js (>= 18)
- Pnpm
- MySQL (khuyến nghị chạy qua Docker từ dự án `cinehub`)

## 📦 Cài đặt

1. **Clone dự án:**
   ```bash
   git clone https://github.com/iamkvnn/cinehub-admin
   cd cinehub-admin
   ```

2. **Cài đặt dependencies:**
   ```bash
   pnpm install
   ```

3. **Cấu hình môi trường:**
   Copy file `.env.example` thành `.env` và cập nhật các giá trị cấu hình.
   ```bash
   cp .env.example .env
   ```

   **File `.env` mẫu:**
   ```env
   # Server
   PORT=3322
   NODE_ENV=development

   # Database (Shared với backend chính)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=root
   DB_DATABASE=cinehub

   # JWT
   JWT_ACCESS_SECRET=your_jwt_access_secret_for_admin

   # CORS
   CORS_ORIGIN=http://localhost:5174
   ```

   **Lưu ý:** Database `cinehub` phải được khởi tạo và đồng bộ từ backend chính (`cinehub`) trước khi chạy admin API này.

## 🏃‍♂️ Chạy dự án (Local Dev)


**Chạy ứng dụng (Development mode):**
   ```bash
   pnpm dev
   ```
   
   - Server API: `http://localhost:3322/api/v1`
   - Swagger Docs: `http://localhost:3322/api-docs`


## 🗄 Database & Migrations

Dự án sử dụng **TypeORM** với các entity đã định nghĩa trong `src/entities/`:

- `User.ts`: Quản lý người dùng và admin.
- `Film.ts`: Thông tin phim.
- `Subscription.ts`: Gói đăng ký.
- `Plan.ts`: Các gói dịch vụ.
- `Comment.ts`, `Review.ts`: Bình luận và đánh giá.
- `Notification.ts`: Thông báo.

### Chạy migrations (nếu có):

```bash
# Generate migration từ entity changes
pnpm migration:generate -- src/migrations/MigrationName

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert
```

**Lưu ý:** `synchronize: false` trong `data-source.ts` để tránh tự động đồng bộ schema (chỉ dùng migrations).

## 📂 Cấu trúc dự án

```
src/
├── config/
│   ├── data-source.ts      # TypeORM Data Source config
│   ├── env.ts              # Environment variables loader
│   └── swagger.ts          # Swagger documentation config
├── controllers/
│   └── dashboard.controller.ts  # Dashboard endpoints
├── entities/               # TypeORM Entities (User, Film, Plan, etc.)
├── middlewares/
│   ├── auth.middleware.ts  # JWT authentication & role guard
│   ├── error.middleware.ts # Global error handler
│   └── validate.middleware.ts  # Request validation
├── routes/
│   ├── dashboard.route.ts  # Dashboard routes
│   └── index.ts            # Main router
├── services/
│   └── dashboard.service.ts  # Business logic cho dashboard
├── utils/
│   ├── ApiError.ts         # Custom Error class
│   └── catchAsync.ts       # Async error wrapper
└── index.ts                # Entry point
```

## 📝 API Endpoints

### Dashboard (Protected - Admin Only)

Tất cả endpoints yêu cầu Bearer Token trong header `Authorization`:

```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

- `GET /api/v1/dashboard/stats`: Lấy thống kê tổng quan (users, films, revenue, views, subscriptions).
- (Các endpoints khác có thể xem trong Swagger docs)

### Authentication

API này **không có endpoint đăng ký/đăng nhập riêng**. Admin cần lấy JWT token từ backend chính (`cinehub`) bằng tài khoản có role `ADMIN`.

## 🔐 Authentication Flow

1. Admin đăng nhập tại backend chính (`cinehub`).
2. Backend trả về `accessToken` (JWT).
3. Frontend admin sử dụng token này gọi API tại `cinehub-admin`.
4. Middleware `auth` verify token và kiểm tra role.

## 📊 Swagger Documentation

Truy cập: `http://localhost:3322/api-docs`

Swagger cung cấp giao diện interactive để test các endpoint trực tiếp.

```

---

**Lưu ý quan trọng:**
- Database phải được khởi tạo từ backend chính (`cinehub`) trước.
- JWT secret phải khớp giữa 2 backend nếu share token (hoặc dùng secret riêng và decode độc lập).
- Dự án này chỉ phục vụ Dashboard Admin, không dành cho end-users.
