# Hướng dẫn cấu hình biến môi trường

Tài liệu này hướng dẫn cài đặt và lấy các giá trị cần thiết cho `backend/.env`.

> **Bảo mật:** Không commit `.env`, không gửi secret lên GitHub hoặc chat. Các giá trị đã từng bị lộ cần được thu hồi và tạo lại trước khi dùng production.

## 1. Chuẩn bị phần mềm

Cài đặt:

- Node.js 20 trở lên
- PostgreSQL 14 trở lên
- Redis 6 trở lên
- Git
- Stripe CLI nếu cần kiểm thử thanh toán Stripe

Cài dependencies:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## 2. Tạo file môi trường

Tạo `backend/.env` dựa trên mẫu dưới đây. Thay toàn bộ giá trị trong dấu `<...>`.

```dotenv
PORT=3001
NODE_ENV=development

DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/phone_shop?schema=public"

CLERK_SECRET_KEY=<Clerk Secret Key>

JWT_ACCESS_SECRET=<random-secret>
JWT_REFRESH_SECRET=<random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

OPENAI_API_KEY=<OpenAI API key>
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=<gmail-address>
MAIL_PASSWORD=<gmail-app-password>
MAIL_FROM=<sender-address>

EMAILJS_SERVICE_ID=<service-id>
EMAILJS_TEMPLATE_ID=<template-id>
EMAILJS_CONFIRM_TEMPLATE_ID=<confirm-template-id>
EMAILJS_PUBLIC_KEY=<public-key>
EMAILJS_PRIVATE_KEY=<private-key>

PUBLISHABLE_STRIPE_KEY=<Stripe publishable test key>
SECRET_STRIPE_KEY=<Stripe secret test key>
STRIPE_WEBHOOK_SECRET=<Stripe webhook signing secret>

FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://[::1]:3000
```

## 3. Hướng dẫn lấy từng biến

### PostgreSQL: `DATABASE_URL`

1. Cài và khởi động PostgreSQL.
2. Tạo database tên `phone_shop`.
3. Điền username, password và port vào chuỗi kết nối.

Ví dụ:

```dotenv
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/phone_shop?schema=public"
```

Sau đó chạy Prisma:

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

## Đồng bộ database cho người khác

Schema và column được cập nhật bằng các file trong `prisma/migrations`, không phải bằng seed.
Sau khi clone project và tạo `backend/.env`, chạy:

```powershell
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Các lệnh trên sẽ tạo Prisma Client, áp dụng toàn bộ migration chưa chạy và seed dữ liệu nền tảng, sản phẩm, variant cùng inventory.

Nếu cần dữ liệu demo mở rộng cho trang Admin, chạy thêm:

```powershell
npm run db:seed:admin
```

### Cập nhật database đang có dữ liệu

Không dùng `db:reset`. Chỉ chạy:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

Migration giữ dữ liệu hiện có và chỉ bổ sung thay đổi cần thiết.

### Tạo database demo sạch hoàn toàn

> **Cảnh báo:** Lệnh này xóa toàn bộ bảng và dữ liệu trong database được trỏ bởi `DATABASE_URL`.

```powershell
npm run db:reset
```

Hoặc chạy không tương tác:

```powershell
npx prisma migrate reset --force
```

Chỉ dùng trên database local/demo, tuyệt đối không dùng trên production.

### Clerk

Các biến liên quan:

- Backend: `CLERK_SECRET_KEY`
- Frontend: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

1. Truy cập [Clerk Dashboard](https://dashboard.clerk.com/).
2. Chọn đúng application và đúng environment, thường là **Development** khi chạy local.
3. Vào **API Keys**.
4. Sao chép Secret Key vào backend.
5. Sao chép Publishable Key vào `frontend/.env.local`.

Hai key phải thuộc **cùng một Clerk instance và cùng environment**. Nếu không, backend thường báo `jwk-kid-mismatch`.

`frontend/.env.local` tối thiểu cần:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<cùng Clerk instance với backend>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### JWT secrets

Đây là secret nội bộ của ứng dụng, không lấy từ dịch vụ bên ngoài. Tạo chuỗi ngẫu nhiên:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Chạy lệnh hai lần và dùng hai kết quả khác nhau cho:

```dotenv
JWT_ACCESS_SECRET=<secret-1>
JWT_REFRESH_SECRET=<secret-2>
```

### Redis

Nếu Redis chạy local với cấu hình mặc định:

```dotenv
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Nếu dùng Redis Cloud hoặc dịch vụ khác, lấy host, port và password trong phần **Connect** của nhà cung cấp.

### Cloudinary

1. Đăng ký/đăng nhập tại [Cloudinary Console](https://console.cloudinary.com/).
2. Mở **Dashboard**.
3. Lấy:
   - Cloud name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

Các biến này được dùng để tải ảnh bill và tài nguyên hình ảnh lên Cloudinary.

### OpenAI

1. Truy cập [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Chọn **Create new secret key**.
3. Lưu key ngay khi tạo vì secret có thể chỉ được hiển thị một lần.
4. Cấu hình:

```dotenv
OPENAI_API_KEY=<OpenAI secret key>
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
```

Tài khoản OpenAI cần có billing/credit phù hợp để gọi API.

### Gmail SMTP

Không dùng mật khẩu Gmail thông thường. Hãy dùng **App Password**:

1. Bật xác thực hai bước cho tài khoản Google.
2. Mở [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Tạo một App Password cho ứng dụng này.
4. Cấu hình:

```dotenv
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=<gmail-address>
MAIL_PASSWORD=<16-character-app-password>
MAIL_FROM=<sender-address>
```

Nếu dùng nhà cung cấp email khác, thay `MAIL_HOST`, `MAIL_PORT` và thông tin xác thực theo tài liệu SMTP của nhà cung cấp.

### EmailJS

1. Đăng nhập [EmailJS](https://dashboard.emailjs.com/).
2. Trong **Email Services**, lấy Service ID.
3. Trong **Email Templates**, lấy ID của template thông thường và template xác nhận.
4. Trong **Account / API Keys**, lấy Public Key và Private Key.

Điền:

```dotenv
EMAILJS_SERVICE_ID=<service-id>
EMAILJS_TEMPLATE_ID=<template-id>
EMAILJS_CONFIRM_TEMPLATE_ID=<confirmation-template-id>
EMAILJS_PUBLIC_KEY=<public-key>
EMAILJS_PRIVATE_KEY=<private-key>
```

### Stripe test mode

1. Đăng nhập [Stripe Dashboard](https://dashboard.stripe.com/).
2. Bật **Test mode**.
3. Vào **Developers → API keys**.
4. Lấy:
   - Publishable key (`pk_test_...`) → `PUBLISHABLE_STRIPE_KEY`
   - Secret key (`sk_test_...`) → `SECRET_STRIPE_KEY`

Không dùng key `live` khi phát triển local.

#### Lấy `STRIPE_WEBHOOK_SECRET`

Cài Stripe CLI theo [Stripe CLI documentation](https://docs.stripe.com/stripe-cli), đăng nhập:

```powershell
stripe login
```

Chạy backend trước, sau đó mở terminal khác:

```powershell
stripe listen --events checkout.session.completed,checkout.session.expired --forward-to http://localhost:3001/api/payments/stripe/webhook
```

CLI sẽ in ra:

```text
Ready! Your webhook signing secret is whsec_...
```

Copy giá trị đó vào:

```dotenv
STRIPE_WEBHOOK_SECRET=whsec_...
```

Mỗi lần chạy `stripe listen`, secret có thể khác. Khi thay đổi secret, cần khởi động lại backend.

Thanh toán test dùng thẻ:

```text
4242 4242 4242 4242
12/34
123
```

### URL frontend và CORS

Khi chạy local:

```dotenv
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://[::1]:3000
```

Khi deploy, thay bằng domain frontend thật và chỉ giữ các origin thực sự cần thiết. Không dùng `*` nếu ứng dụng có authentication/cookie.

## 4. Kiểm tra cấu hình

Không in toàn bộ `.env` vào log. Có thể kiểm tra các biến bắt buộc bằng PowerShell:

```powershell
cd backend
node -e "const fs=require('fs'); const required=['DATABASE_URL','CLERK_SECRET_KEY','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET','OPENAI_API_KEY','SECRET_STRIPE_KEY','STRIPE_WEBHOOK_SECRET']; const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(x=>x && !x.trim().startsWith('#')).map(x=>{const i=x.indexOf('='); return [x.slice(0,i).trim(),x.slice(i+1).trim().replace(/^['\"]|['\"]$/g,'')] })); const missing=required.filter(k=>!env[k] || env[k].includes('<')); if(missing.length){console.error('Missing:',missing.join(', ')); process.exit(1)} console.log('Required environment variables are present.');"
```

Khởi động backend:

```powershell
npm run start:dev
```

Khởi động frontend ở terminal khác:

```powershell
cd ..\frontend
npm run dev
```

## 5. Checklist trước khi chạy

- [ ] `backend/.env` tồn tại và không được commit.
- [ ] `frontend/.env.local` có Publishable Key cùng Clerk instance với backend.
- [ ] PostgreSQL đã tạo database `phone_shop`.
- [ ] Prisma đã generate và migrate.
- [ ] Redis đang chạy.
- [ ] Cloudinary có đủ ba giá trị.
- [ ] OpenAI key còn hiệu lực và tài khoản có credit.
- [ ] Gmail dùng App Password, không dùng mật khẩu thường.
- [ ] Stripe đang ở Test mode.
- [ ] Stripe CLI đang forward đúng endpoint webhook.
- [ ] Backend đã restart sau khi thay đổi `.env`.

## 6. Xử lý lỗi thường gặp

### `jwk-kid-mismatch`

`CLERK_SECRET_KEY` và `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` không cùng Clerk instance/environment. Lấy lại cả hai key từ cùng một application trong Clerk Dashboard.

### Stripe webhook trả lỗi hoặc không cập nhật đơn hàng

- Kiểm tra backend đang chạy ở port `3001`.
- Kiểm tra URL forward có đúng `/api/payments/stripe/webhook`.
- Dùng `stripe listen` để lấy lại `STRIPE_WEBHOOK_SECRET`.
- Restart backend sau khi cập nhật secret.

### Prisma báo thiếu column

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

Không tự ý xóa database production để xử lý lỗi migration.
