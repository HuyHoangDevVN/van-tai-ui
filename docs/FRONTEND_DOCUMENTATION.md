# Tài liệu Frontend - Hệ thống Đặt Vé Xe Khách

> **Version**: 1.0  
> **Ngày cập nhật**: 2025  
> **Công nghệ**: React 19 + TypeScript + Vite 7

---

## Mục lục

1. [Tổng quan hệ thống FE](#1-tổng-quan-hệ-thống-fe)
   - [Kiến trúc](#11-kiến-trúc)
   - [Technology Stack](#12-technology-stack)
   - [Phân quyền](#13-phân-quyền-roles)
   - [UI Design Guidelines](#14-ui-design-guidelines-minimalist)
2. [Luồng nghiệp vụ](#2-luồng-nghiệp-vụ)
   - [Luồng Login/Register](#21-luồng-loginregister)
   - [Luồng Đặt Vé (Customer)](#22-luồng-đặt-vé-customer)
   - [Luồng Admin Quản lý](#23-luồng-admin-quản-lý)
3. [Mapping FE – BE](#3-mapping-fe--be)
   - [API Endpoints](#31-api-endpoints-mapping)
   - [Data Models](#32-entity-models-mapping)
   - [Response Format](#33-response-format)
4. [Cách mở rộng tính năng](#4-cách-mở-rộng-tính-năng)
   - [Thêm trang mới](#41-thêm-trang-mới)
   - [Thêm API Service](#42-thêm-api-service)
   - [Thêm Route Guard](#43-thêm-route-guard)
   - [Best Practices](#44-best-practices)
5. [Hướng dẫn chạy dự án](#5-hướng-dẫn-chạy-dự-án)
6. [Danh sách file](#6-danh-sách-file)

---

## 1. Tổng quan hệ thống FE

### 1.1 Kiến trúc

```
base-reactjs/src/
├── components/                  # Shared components
│   ├── common/                  # ErrorBoundary, LoadingSpinner
│   ├── guards/                  # Route guards
│   │   └── ProtectedRoute.tsx   # Auth & Role guards
│   ├── layout/
│   │   ├── admin/               # AdminLayout
│   │   ├── auth/                # AuthLayout
│   │   └── customer/            # CustomerLayout
│   └── sidebars/                # Sidebar components
│
├── contexts/                    # React Context
│   └── AuthContext.tsx          # Authentication state management
│
├── features/                    # Feature modules
│   ├── admin/
│   │   ├── hooks/               # useDrivers, useTrips, useVehicles...
│   │   ├── pages/               # Admin pages
│   │   │   ├── dashboard/       # Dashboard
│   │   │   ├── drivers/         # Quản lý tài xế
│   │   │   ├── vehicles/        # Quản lý xe
│   │   │   ├── trips/           # Quản lý chuyến
│   │   │   ├── tickets/         # Quản lý vé (TicketManagement)
│   │   │   ├── user/            # Quản lý khách hàng (CustomerManagement)
│   │   │   └── reports/         # Báo cáo
│   │   └── routes/              # Admin routes
│   │
│   ├── auth/
│   │   ├── pages/               # Login, Register
│   │   └── routes/              # Auth routes
│   │
│   ├── customer/
│   │   ├── pages/
│   │   │   ├── SearchTrips.tsx  # Tìm chuyến xe
│   │   │   ├── TripDetail.tsx   # Chi tiết + chọn ghế
│   │   │   ├── Booking.tsx      # Xác nhận đặt vé
│   │   │   └── MyTickets.tsx    # Vé của tôi
│   │   └── routes/              # Customer routes
│   │
│   └── home/                    # Landing page
│
├── services/api/                # API Services
│   ├── driver.service.ts
│   ├── vehicle.service.ts
│   ├── trip.service.ts
│   ├── ticket.service.ts
│   ├── customer.service.ts
│   └── index.ts
│
├── base/
│   ├── models/entities/         # TypeScript types
│   ├── config/                  # React Query config
│   └── services/                # HttpService base class
│
├── routes/                      # Route definitions
│   └── routes.ts                # Main router
│
└── utils/                       # Utilities
```

### 1.2 Technology Stack

| Layer            | Công nghệ              | Purpose                 |
| ---------------- | ---------------------- | ----------------------- |
| **Framework**    | React 19               | UI Library              |
| **Language**     | TypeScript 5.x         | Type safety             |
| **Build Tool**   | Vite 7.x               | Fast build & HMR        |
| **Router**       | @tanstack/react-router | Type-safe routing       |
| **Server State** | @tanstack/react-query  | Data fetching & caching |
| **UI Framework** | Ant Design 5.x         | Component library       |
| **Styling**      | Tailwind CSS 4.x       | Utility-first CSS       |
| **HTTP Client**  | Axios                  | API calls               |
| **Auth**         | JWT (localStorage)     | Authentication          |
| **Date**         | dayjs + date-fns       | Date manipulation       |

### 1.3 Phân quyền (Roles)

| Role         | Mô tả                   | Accessible Routes                    |
| ------------ | ----------------------- | ------------------------------------ |
| **Guest**    | Chưa đăng nhập          | `/`, `/search`, `/auth/*`, `/trip/*` |
| **Customer** | Khách hàng đã đăng nhập | + `/booking`, `/my-tickets`          |
| **Admin**    | Quản trị viên           | `/admin/*` (exclusive)               |

**Route Guards:**

```typescript
// AdminGuard - Chỉ admin mới vào được
<AdminGuard>
  <AdminLayout />
</AdminGuard>

// CustomerGuard - Customer hoặc Guest
<CustomerGuard>
  <CustomerLayout />
</CustomerGuard>

// AuthGuard - Phải đăng nhập
<AuthGuard>
  <MyTickets />
</AuthGuard>
```

### 1.4 UI Design Guidelines (Minimalist)

**Color Palette:**

```css
--primary: #111827; /* gray-900 */
--background: #ffffff; /* white */
--surface: #f9fafb; /* gray-50 */
--text-primary: #1a1a1a;
--text-secondary: #6b7280; /* gray-500 */
--border: #e5e7eb; /* gray-200 */
--accent: #3b82f6; /* blue-500 - for CTAs */
```

**Design Rules:**

- ✅ Clean, whitespace-focused layouts
- ✅ Subtle shadows (`shadow-sm`, `shadow`)
- ✅ Rounded corners (6-8px)
- ✅ System font stack
- ❌ No gradients
- ❌ No heavy animations
- ❌ No excessive colors

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng Login/Register

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

                    ┌────────────────┐
                    │   Landing /    │
                    │   (Guest)      │
                    └───────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │  /auth/login    │         │ /auth/register  │
    │                 │         │                 │
    │ - Email         │         │ - Họ tên        │
    │ - Password      │         │ - Email         │
    │                 │         │ - Số điện thoại │
    └────────┬────────┘         │ - Password      │
             │                  │ - Confirm pass  │
             │                  └────────┬────────┘
             │                           │
             │         ┌─────────────────┘
             ▼         ▼
    ┌─────────────────────────┐
    │  AuthContext.login()    │
    │  AuthContext.register() │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │  Store in localStorage: │
    │  - token (JWT)          │
    │  - user (JSON)          │
    └───────────┬─────────────┘
                │
    ┌───────────┴───────────┐
    ▼                       ▼
┌─────────┐           ┌─────────┐
│ Admin   │           │Customer │
│ Role    │           │ Role    │
└────┬────┘           └────┬────┘
     │                     │
     ▼                     ▼
  /admin/              /search
  dashboard
```

**Files liên quan:**

- `src/features/auth/pages/Login.tsx`
- `src/features/auth/pages/Register.tsx`
- `src/contexts/AuthContext.tsx`

**Demo credentials:**

```
Admin:    admin@example.com / admin123
Customer: user@example.com  / user123
```

### 2.2 Luồng Đặt Vé (Customer)

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOOKING FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

[1] TÌM CHUYẾN XE (/search)
    ┌─────────────────────────────────────┐
    │ Form tìm kiếm:                      │
    │ ┌─────────────┐ ┌─────────────┐     │
    │ │ Điểm đi ▼   │ │ Điểm đến ▼  │     │
    │ └─────────────┘ └─────────────┘     │
    │ ┌─────────────┐ ┌─────────────┐     │
    │ │ Ngày đi 📅  │ │ [Tìm kiếm]  │     │
    │ └─────────────┘ └─────────────┘     │
    └─────────────────────────────────────┘
                    │
                    ▼ GET /chuyen-xe/tim-kiem
    ┌─────────────────────────────────────┐
    │ Kết quả tìm kiếm:                   │
    │ ┌─────────────────────────────────┐ │
    │ │ 🚌 Hà Nội → Hải Phòng          │ │
    │ │ 08:00 | 250,000đ | 15 ghế trống│ │
    │ │                    [Chọn] →    │ │
    │ └─────────────────────────────────┘ │
    └─────────────────────────────────────┘
                    │
                    ▼
[2] CHI TIẾT CHUYẾN (/trip/:tripId)
    ┌─────────────────────────────────────┐
    │ Thông tin chuyến:                   │
    │ - Tuyến: Hà Nội → Hải Phòng         │
    │ - Ngày: 15/02/2025                  │
    │ - Giờ khởi hành: 08:00              │
    │ - Xe: 29A-12345 (Bus Giường nằm)    │
    │                                     │
    │ Sơ đồ ghế:                          │
    │ ┌───┬───┬───┬───┬───┬───┬───┬───┐   │
    │ │ A1│ A2│ A3│ A4│ A5│ A6│ A7│ A8│   │
    │ │ 🟢│ 🔴│ 🟢│ 🟢│ 🔴│ 🟢│ 🟢│ 🔴│   │
    │ └───┴───┴───┴───┴───┴───┴───┴───┘   │
    │ 🟢 Trống  🔴 Đã đặt  🔵 Đang chọn   │
    │                                     │
    │ Ghế đã chọn: A3 (250,000đ)          │
    │              [Đặt vé] →             │
    └─────────────────────────────────────┘
                    │
                    ▼
[3] XÁC NHẬN ĐẶT VÉ (/booking)
    ┌─────────────────────────────────────┐
    │ Thông tin hành khách:               │
    │ ┌─────────────────────────────────┐ │
    │ │ Họ tên *     │ Nguyễn Văn A    │ │
    │ │ Điện thoại * │ 0912345678      │ │
    │ └─────────────────────────────────┘ │
    │                                     │
    │ Thông tin vé:                       │
    │ - Chuyến: Hà Nội → Hải Phòng        │
    │ - Ghế: A3                           │
    │ - Giá: 250,000đ                     │
    │                                     │
    │ ┌─────────────┐ ┌─────────────┐     │
    │ │   Hủy bỏ    │ │ Xác nhận ✓  │     │
    │ └─────────────┘ └─────────────┘     │
    └─────────────────────────────────────┘
                    │
                    ▼ POST /ve/dat-ve
    ┌─────────────────────────────────────┐
    │ ✅ ĐẶT VÉ THÀNH CÔNG!               │
    │                                     │
    │ Mã vé: #VE-2025-001234              │
    │                                     │
    │ [Xem vé của tôi] → /my-tickets      │
    └─────────────────────────────────────┘

[4] VÉ CỦA TÔI (/my-tickets)
    ┌─────────────────────────────────────┐
    │ Danh sách vé đã đặt:                │
    │ ┌─────────────────────────────────┐ │
    │ │ #001234 | HN→HP | 15/02 | A3   │ │
    │ │ Đã xác nhận    [Xem] [Hủy vé]  │ │
    │ └─────────────────────────────────┘ │
    └─────────────────────────────────────┘
```

**API Calls trong luồng:**

| Step | Action          | Method | Endpoint                                        | Body                                              |
| ---- | --------------- | ------ | ----------------------------------------------- | ------------------------------------------------- |
| 1    | Tìm chuyến      | GET    | `/chuyen-xe/tim-kiem?diemDi=X&diemDen=Y&ngay=Z` | -                                                 |
| 2a   | Chi tiết chuyến | GET    | `/chuyen-xe/{maChuyen}`                         | -                                                 |
| 2b   | Ghế theo chuyến | GET    | `/ve/theo-chuyen/{maChuyen}`                    | -                                                 |
| 3    | Đặt vé          | POST   | `/ve/dat-ve`                                    | `{maKhach, maChuyen, viTri, maGhe, phuongThucTT}` |
| 4    | Danh sách vé    | GET    | `/ve/theo-khach/{maKhach}`                      | -                                                 |
| -    | Hủy vé          | PUT    | `/ve/{stt}/huy`                                 | -                                                 |

**Files liên quan:**

- `src/features/customer/pages/SearchTrips.tsx`
- `src/features/customer/pages/TripDetail.tsx`
- `src/features/customer/pages/Booking.tsx`
- `src/features/customer/pages/MyTickets.tsx`

### 2.3 Luồng Admin Quản lý

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN MANAGEMENT FLOW                        │
└─────────────────────────────────────────────────────────────────┘

                    ┌────────────────┐
                    │ Admin Login    │
                    └───────┬────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │    /admin/dashboard      │
              │                          │
              │  ┌──────┐ ┌──────┐       │
              │  │ 45   │ │ 12   │       │
              │  │Tài xế│ │ Xe   │       │
              │  └──────┘ └──────┘       │
              │  ┌──────┐ ┌──────┐       │
              │  │ 120  │ │ 450  │       │
              │  │Chuyến│ │ Vé   │       │
              │  └──────┘ └──────┘       │
              └──────────┬───────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌─────────┐        ┌─────────┐         ┌─────────┐
│ /drivers│        │/vehicles│         │ /trips  │
│         │        │         │         │         │
│ [CRUD]  │        │ [CRUD]  │         │ [CRUD]  │
│ Tài xế  │        │   Xe    │         │ Chuyến  │
└─────────┘        └─────────┘         └─────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Quản lý Tài xế (/admin/drivers)     │
│                                     │
│ [+ Thêm mới]  🔍 Tìm kiếm           │
│ ┌───┬────────┬──────────┬────────┐  │
│ │ID │ Họ tên │ Chức vụ  │ Actions│  │
│ ├───┼────────┼──────────┼────────┤  │
│ │ 1 │Nguyễn A│ Tài xế   │ ✏️ 🗑️ │  │
│ │ 2 │Trần B  │ Phụ xe   │ ✏️ 🗑️ │  │
│ └───┴────────┴──────────┴────────┘  │
│ < 1 2 3 ... 10 >                    │
└─────────────────────────────────────┘
```

**Admin Features:**

| Page       | Route                | Actions      | API Endpoints                  |
| ---------- | -------------------- | ------------ | ------------------------------ |
| Dashboard  | `/admin/dashboard`   | View stats   | GET `/tai-xe`, GET `/xe`, etc. |
| Tài xế     | `/admin/drivers`     | CRUD, Search | `/tai-xe/*`                    |
| Xe         | `/admin/vehicles`    | CRUD, Filter | `/xe/*`                        |
| Chuyến xe  | `/admin/trips`       | CRUD, Search | `/chuyen-xe/*`                 |
| Quản lý vé | `/admin/tickets`     | View, Cancel | GET `/ve`, PUT `/ve/{stt}/huy` |
| Khách hàng | `/admin/users`       | CRUD         | `/khach-hang/*`                |
| Báo cáo    | `/admin/reports`     | View reports | `/baocao/*`                    |
| Bảo trì    | `/admin/maintenance` | CRUD         | `/bao-tri/*`                   |

---

## 3. Mapping FE – BE

### 3.1 API Endpoints Mapping

**Base URL:** `http://localhost:5000/api`

| Module      | FE Service           | BE Endpoint    | Methods                |
| ----------- | -------------------- | -------------- | ---------------------- |
| Tài xế      | `DriverService`      | `/tai-xe`      | GET, POST, PUT, DELETE |
| Xe          | `VehicleService`     | `/xe`          | GET, POST, PUT, DELETE |
| Chuyến xe   | `TripService`        | `/chuyen-xe`   | GET, POST, PUT, DELETE |
| Vé          | `TicketService`      | `/ve`          | GET, POST, PUT         |
| Khách hàng  | `CustomerService`    | `/khach-hang`  | GET, POST, PUT, DELETE |
| Tuyến đường | `RouteService`       | `/tuyen-duong` | GET, POST, PUT, DELETE |
| Bảo trì     | `MaintenanceService` | `/bao-tri`     | GET, POST, PUT, DELETE |
| Báo cáo     | `ReportService`      | `/baocao/*`    | GET                    |

### 3.2 Entity Models Mapping

#### Driver (Tài xế)

```typescript
interface Driver {
  id: number;
  hoTen: string; // Họ tên
  ngaySinh: string; // YYYY-MM-DD
  gioiTinh: string; // Nam/Nữ
  diaChi: string;
  maChucVu: string; // TX (Tài xế) / PX (Phụ xe)
  luongCoBan: number;
  kiemNhiem: boolean;
  bangLai?: BangLai[];
  danhSachSoDienThoai?: string[];
}
```

#### Vehicle (Xe)

```typescript
interface Vehicle {
  bienSo: string; // Primary key
  loaiXe: string; // XBN (Bus ngồi) / XGN (Giường nằm)
  sucChua: number;
  trangThai: string; // Hoạt động / Bảo trì
  namSanXuat: number;
  tenXe?: string;
}
```

#### Trip (Chuyến xe)

```typescript
interface Trip {
  id: number; // Mã chuyến
  bienSoXe: string;
  maTuyenDuong: string;
  ngayKhoiHanh: string; // YYYY-MM-DD
  gioKhoiHanh: string; // HH:mm
  trangThai: string;
  soGheTrong?: number;
  chiTietTaiXe?: ChiTietTaiXe[];
}
```

#### Ticket (Vé)

```typescript
interface Ticket {
  stt: number; // Primary key
  maKhach: number;
  maChuyen: number;
  ngayDat: string;
  phuongThucThanhToan: string;
  trangThai: string; // Đã đặt / Đã hủy / Đã thanh toán
  viTri?: string; // Vị trí ghế
  maGhe?: number;
  giaVe?: number;
}
```

#### Customer (Khách hàng)

```typescript
interface Customer {
  id: number; // Mã khách
  hoTen: string;
  soDienThoai: string;
  email?: string;
}
```

### 3.3 Response Format

**Successful Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errorCode": null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Paginated Response:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pageIndex": 1,
    "pageSize": 10,
    "totalRecords": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [{ "field": "email", "message": "Email không hợp lệ" }]
}
```

---

## 4. Cách mở rộng tính năng

### 4.1 Thêm trang mới

**Bước 1: Tạo Page Component**

```tsx
// src/features/customer/pages/NewPage.tsx
import { Card, Typography } from 'antd';

const { Title } = Typography;

export default function NewPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-0 shadow-sm">
        <Title level={3}>Trang mới</Title>
        {/* Content */}
      </Card>
    </div>
  );
}
```

**Bước 2: Thêm Route**

```tsx
// src/features/customer/routes/customer.routes.tsx
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from '@/routes/routes';

const newPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'new-page',
  component: lazyRouteComponent(() => import('../pages/NewPage')),
});

// Export trong routeTree
export const customerTree = rootRoute.addChildren([
  // ... existing routes
  newPageRoute,
]);
```

**Bước 3: Đăng ký Route**

```tsx
// src/routes/routes.ts
import { customerTree } from '@/features/customer';

const routeTree = rootRoute.addChildren([
  // ... existing
  ...customerTree.children,
]);
```

### 4.2 Thêm API Service

**Bước 1: Tạo Service Class**

```typescript
// src/services/api/new.service.ts
import { HttpService } from '@/base/services/http.service';
import { BaseResponse } from '@/base/models/base';

interface NewEntity {
  id: number;
  name: string;
}

export class NewService extends HttpService {
  private static readonly BASE_PATH = '/new-endpoint';

  async getAll(): Promise<BaseResponse<NewEntity[]>> {
    return this.get<BaseResponse<NewEntity[]>>(NewService.BASE_PATH);
  }

  async getById(id: number): Promise<BaseResponse<NewEntity>> {
    return this.get<BaseResponse<NewEntity>>(`${NewService.BASE_PATH}/${id}`);
  }

  async create(data: Partial<NewEntity>): Promise<BaseResponse<NewEntity>> {
    return this.post<BaseResponse<NewEntity>>(NewService.BASE_PATH, data);
  }

  async update(id: number, data: Partial<NewEntity>): Promise<BaseResponse<NewEntity>> {
    return this.put<BaseResponse<NewEntity>>(`${NewService.BASE_PATH}/${id}`, data);
  }

  async delete(id: number): Promise<BaseResponse<void>> {
    return this.remove<BaseResponse<void>>(`${NewService.BASE_PATH}/${id}`);
  }
}

export const newService = new NewService();
```

**Bước 2: Tạo React Query Hook**

```typescript
// src/features/admin/hooks/useNewEntity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { newService } from '@/services/api/new.service';

export const useNewEntities = () => {
  return useQuery({
    queryKey: ['newEntities'],
    queryFn: () => newService.getAll(),
    select: (response) => response.data,
  });
};

export const useCreateNewEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NewEntity>) => newService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newEntities'] });
      message.success('Thêm thành công');
    },
    onError: () => {
      message.error('Có lỗi xảy ra');
    },
  });
};
```

### 4.3 Thêm Route Guard

```tsx
// src/components/guards/ProtectedRoute.tsx
// Thêm guard mới

interface CustomGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
}

export function CustomGuard({ children, requiredPermission }: CustomGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/auth/login' });
      return;
    }

    if (!user?.permissions?.includes(requiredPermission)) {
      navigate({ to: '/unauthorized' });
    }
  }, [isAuthenticated, user, requiredPermission]);

  if (!isAuthenticated || !user?.permissions?.includes(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
```

### 4.4 Best Practices

**Component Structure:**

```tsx
// ✅ Good - Single responsibility
function DriverList() {
  /* List logic */
}
function DriverForm() {
  /* Form logic */
}
function DriverDetail() {
  /* Detail logic */
}

// ❌ Bad - God component
function DriverPage() {
  /* Everything in one */
}
```

**State Management:**

```tsx
// ✅ Good - Server state with React Query
const { data, isLoading } = useDrivers();

// ❌ Bad - Local state for server data
const [drivers, setDrivers] = useState([]);
useEffect(() => {
  fetchDrivers().then(setDrivers);
}, []);
```

**Error Handling:**

```tsx
// ✅ Good - Handle in mutation
const mutation = useMutation({
  onError: (error) => {
    message.error(error.message || 'Có lỗi xảy ra');
  },
});

// ✅ Good - Error boundary for pages
<ErrorBoundary fallback={<ErrorFallback />}>
  <DriverList />
</ErrorBoundary>;
```

**TypeScript:**

```typescript
// ✅ Good - Explicit types
interface DriverListProps {
  onSelect: (driver: Driver) => void;
  filters?: DriverFilters;
}

// ❌ Bad - any type
interface DriverListProps {
  onSelect: (driver: any) => void;
}
```

---

## 5. Hướng dẫn chạy dự án

### 5.1 Yêu cầu

- Node.js >= 18.x
- npm >= 9.x hoặc pnpm >= 8.x
- Backend API chạy tại `http://localhost:5000`

### 5.2 Cài đặt

```bash
# Clone và di chuyển vào thư mục
cd base-reactjs

# Cài đặt dependencies
npm install
# hoặc
pnpm install
```

### 5.3 Cấu hình

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5.4 Chạy development

```bash
npm run dev
# hoặc
pnpm dev
```

Mở browser: `http://localhost:5173`

### 5.5 Build production

```bash
npm run build
npm run preview
```

### 5.6 Scripts

| Script    | Mô tả                   |
| --------- | ----------------------- |
| `dev`     | Chạy development server |
| `build`   | Build production        |
| `lint`    | Kiểm tra ESLint         |
| `preview` | Preview bản build       |

---

## 6. Danh sách file

### 6.1 Files mới tạo (Customer Module)

| File                                                | Mô tả                     |
| --------------------------------------------------- | ------------------------- |
| `src/contexts/AuthContext.tsx`                      | Auth state management     |
| `src/contexts/index.ts`                             | Re-export contexts        |
| `src/components/guards/ProtectedRoute.tsx`          | Route guards              |
| `src/components/guards/index.ts`                    | Re-export guards          |
| `src/components/layout/customer/CustomerLayout.tsx` | Customer layout           |
| `src/features/customer/pages/SearchTrips.tsx`       | Tìm chuyến xe             |
| `src/features/customer/pages/TripDetail.tsx`        | Chi tiết + chọn ghế       |
| `src/features/customer/pages/Booking.tsx`           | Xác nhận đặt vé           |
| `src/features/customer/pages/MyTickets.tsx`         | Vé của tôi                |
| `src/features/customer/routes/customer.routes.tsx`  | Customer routes           |
| `src/features/customer/index.ts`                    | Re-export customer module |

### 6.2 Files đã chỉnh sửa

| File                                                 | Thay đổi                         |
| ---------------------------------------------------- | -------------------------------- |
| `src/App.tsx`                                        | Wrap với AuthProvider            |
| `src/routes/routes.ts`                               | Import customerTree              |
| `src/features/auth/pages/Login.tsx`                  | Minimalist design, role redirect |
| `src/features/auth/pages/Register.tsx`               | Full registration form           |
| `src/features/home/pages/Home.tsx`                   | Landing page với CTA             |
| `src/features/admin/pages/tickets/TicketBooking.tsx` | → TicketManagement               |
| `src/features/admin/pages/user/User.tsx`             | → CustomerManagement             |
| `src/components/sidebars/admin/SidebarAdmin.tsx`     | Thêm menu users                  |
| `package.json`                                       | Thêm dayjs dependency            |

### 6.3 Tổng hợp

| Loại                        | Số lượng |
| --------------------------- | -------- |
| Files mới (Customer module) | 11       |
| Files chỉnh sửa             | 9        |
| **Tổng**                    | **20**   |

---

## Phụ lục

### A. Troubleshooting

**CORS Error:**

```
Access to XMLHttpRequest has been blocked by CORS policy
```

→ Kiểm tra Backend CORS cho `http://localhost:5173`

**Network Error:**

```
ERR_CONNECTION_REFUSED
```

→ Kiểm tra Backend API đang chạy

**404 Not Found:**
→ Kiểm tra endpoint URL trong API docs

### B. Useful Links

- [API Documentation](./API_DOCUMENTATION.md)
- [React Query Docs](https://tanstack.com/query/latest)
- [Ant Design Components](https://ant.design/components/overview)
- [@tanstack/react-router](https://tanstack.com/router/latest)

---

_Tài liệu được tạo bởi AI Assistant_  
_Cập nhật: 2025_
