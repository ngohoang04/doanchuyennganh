# ✅ Tích hợp Chức năng Đăng nhập/Đăng ký qua API

## 📋 Các file được tạo/sửa:

### 📁 Services
- `src/services/AuthService.js` - Service gọi API authentication
- `src/services/Api.js` - Axios instance với interceptors

### 📁 Context
- `src/context/AuthContext.js` - Auth context + useAuth hook

### 📁 Routes
- `src/routes/ProtectedRoute.js` - Component bảo vệ routes

### 📁 Pages
- `src/pages/Login.js` - Page đăng nhập (sử dụng API)
- `src/pages/Register.js` - Page đăng ký (sử dụng API)
- `src/pages/auth.css` - Styling cho auth pages

### 📁 Components
- `src/components/header.js` - Header cập nhật (hiển thị user menu)
- `src/components/header.css` - CSS cho user dropdown

### 📁 Hooks
- `src/hooks/useAuth.js` - Custom hook để xử dụng auth

### 📁 Khác
- `src/App.js` - Wrap AuthProvider
- `src/routes/AppRoutes.js` - Cập nhật routes

---

## 🚀 Cách hoạt động

### 1. **Đăng ký (Register)**
```
User nhập username, email, password, sđt
   ↓
Gửi request POST /api/auth/register
   ↓
Backend validate + hash password + tạo User
   ↓
Return user + token
   ↓
Redirect to Login
```

### 2. **Đăng nhập (Login)**
```
User nhập email + password
   ↓
Gửi request POST /api/auth/login
   ↓
Backend validate + compare password
   ↓
Return user + token
   ↓
Lưu token + user vào localStorage
   ↓
AuthContext cập nhật state
   ↓
Redirect to Home
```

### 3. **User Icon Flow**
```
Click icon 👤
   ↓
Nếu chưa login → Redirect to /login
   ↓
Nếu đã login → Hiển thị user dropdown menu
   ├─ Profile (🎯 chưa implement)
   ├─ Orders (🎯 chưa implement)
   ├─ Favorites (🎯 chưa implement)
   ├─ Settings (🎯 chưa implement)
   └─ Logout
```

---

## 🔐 Token Management

### Interceptors
- ✅ Tự động thêm token vào `Authorization: Bearer <token>` header
- ✅ Xử lý token expired (401) → redirect to login

### Local Storage
```javascript
localStorage.setItem('token', response.data.token)
localStorage.setItem('user', JSON.stringify(response.data.user))
```

---

## 📦 API Endpoints

### Backend (Node.js)
```
POST /api/auth/register
- Body: { username, email, password, phone }
- Response: { user, token }

POST /api/auth/login
- Body: { email, password }
- Response: { user, token }
```

---

## 🎯 TODO (Chưa implement)

1. ❌ Profile Page - Chỉnh sửa thông tin user
2. ❌ Forget Password - Đặt lại mật khẩu
3. ❌ Email Verification - Xác thực email
4. ❌ Refresh Token - Auto refresh token
5. ❌ Role-based Access - Admin panel
6. ❌ OAuth (Google, Facebook) - Social login

---

## 🧪 Test

Để test chức năng:

1. **Backend chạy:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend chạy:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test Đăng ký:**
   - Vào `/register`
   - Nhập thông tin
   - Submit → DB tạo user

4. **Test Đăng nhập:**
   - Vào `/login`
   - Nhập email + password
   - Nếu login thành công:
     - Token lưu vào localStorage
     - User info lưu vào localStorage
     - Header hiển thị user menu
     - Click logout → clear storage

---

## 📚 Component Tree

```
App (with AuthProvider)
├── AppRoutes
│   ├── /register → Register (public)
│   ├── /login → Login (public)
│   └── / → Home (Layout)
│       ├── Header
│       │   └── User Menu (if authenticated)
│       ├── main (Outlet)
│       └── Footer
└── AuthContext
    └── useAuth hook (for all components)
```

---

## 🔍 Error Handling

```javascript
// Validation errors từ backend → hiển thị trên form
// Network errors → hiển thị alert
// 401 Token expired → auto redirect to login
```

---

## 📱 Responsive Design

- ✅ Mobile-friendly auth forms
- ✅ User dropdown responsive
- ✅ Touch-friendly buttons

---

**Status:** ✅ Ready for testing
**Date:** April 16, 2026
