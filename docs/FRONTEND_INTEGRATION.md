# Tài liệu Frontend - Hệ thống Đặt Vé Xe Khách

## Mục lục

1. [Tổng quan hệ thống FE](#1-tổng-quan-hệ-thống-fe)
2. [Luồng nghiệp vụ](#2-luồng-nghiệp-vụ)
3. [Mapping FE – BE](#3-mapping-fe--be)
4. [Cách mở rộng tính năng](#4-cách-mở-rộng-tính-năng)
5. [Hướng dẫn chạy dự án](#5-hướng-dẫn-chạy-dự-án)

---

## 1. Tổng quan hệ thống FE

### 1.1 Kiến trúc

```
base-reactjs/
├── src/
│   ├── components/              # Shared components
│   │   ├── common/              # ErrorBoundary, LoadingSpinner
│   │   ├── guards/              # ProtectedRoute, AdminGuard
│   │   ├── layout/              # Layouts (Admin, Customer, Auth)
│   │   └── sidebars/            # Admin Sidebar
│   │
│   ├── contexts/                # React Context
│   │   └── AuthContext.tsx      # Authentication state
│   │
│   ├── features/
│   │   ├── admin/               # Admin module
│   │   │   ├── hooks/           # useDrivers, useTrips, etc.
│   │   │   ├── pages/           # Dashboard, DriverList, TicketManagement
│   │   │   └── routes/          # Admin route definitions
│   │   │
│   │   ├── auth/                # Auth module
│   │   │   ├── pages/           # Login, Register
│   │   │   └── routes/          # Auth route definitions
│   │   │
│   │   ├── customer/            # Customer module
│   │   │   ├── pages/           # SearchTrips, TripDetail, Booking, MyTickets
│   │   │   └── routes/          # Customer route definitions
│   │   │
│   │   └── home/                # Landing page
│   │
│   ├── services/api/            # API services
│   ├── base/models/entities/    # Entity TypeScript types
│   └── utils/                   # Utilities (format, etc.)
```

### 1.2 Technology Stack

| Layer        | Công nghệ              | Phiên bản |
| ------------ | ---------------------- | --------- |
| Framework    | React                  | 19.x      |
| Language     | TypeScript             | 5.x       |
| Build Tool   | Vite                   | 7.x       |
| Router       | @tanstack/react-router | 1.x       |
| Server State | @tanstack/react-query  | 5.x       |
| UI Framework | Ant Design             | 5.x       |
| CSS          | Tailwind CSS           | 4.x       |
| HTTP Client  | Axios                  | 1.x       |
| Auth         | JWT (localStorage)     | -         |

### 1.3 Phân quyền (Roles)

| Role         | Mô tả                   | Routes                                          |
| ------------ | ----------------------- | ----------------------------------------------- |
| **Guest**    | Chưa đăng nhập          | `/`, `/search`, `/auth/*`                       |
| **Customer** | Khách hàng đã đăng nhập | `/search`, `/trip/*`, `/booking`, `/my-tickets` |
| **Admin**    | Quản trị viên           | `/admin/*`                                      |

### 1.4 UI Design Guidelines (Minimalist)

- **Màu chủ đạo**: Trắng (#fff), Xám (#f9fafb, #6b7280), Đen (#1a1a1a)
- **Accent color**: Gray-900 (#111827)
- **Font**: System font (sans-serif)
- **Border radius**: 6-8px
- **Spacing**: Tailwind spacing scale
- **Shadow**: Minimal, subtle shadows
- **No gradient, no heavy animations**

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng Login

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                │
└─────────────────────────────────────────────────────────────────┘

[User] ─→ [/auth/login] ─→ [Nhập Email + Password]
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Validate    │
                            │  Form        │
                            └──────────────┘
                                    │
                                    ▼ (Submit)
                            ┌──────────────┐
                            │ Call Auth    │
                            │ API (mock)   │
                            └──────────────┘
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                   [Success]               [Error]
                        │                       │
                        ▼                       ▼
              ┌─────────────────┐      [Show Error Alert]
              │ Store JWT in    │
              │ localStorage    │
              │ + User info     │
              └─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │ Check Role      │
              └─────────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
      [Role: Admin]           [Role: Customer]
            │                       │
            ▼                       ▼
   [Redirect /admin]      [Redirect /search]
```

**Components liên quan:**

- [Login.tsx](../src/features/auth/pages/Login.tsx)
- [AuthContext.tsx](../src/contexts/AuthContext.tsx)

**API Endpoint:** (Mock - chưa có backend auth)

### 2.2 Luồng Đặt Vé (Customer)

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOOKING FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

[Customer] ─→ [/search] ─→ [Tìm chuyến xe]
                                │
                                ▼
                    ┌───────────────────┐
                    │ Nhập:             │
                    │ - Điểm đi         │
                    │ - Điểm đến        │
                    │ - Ngày đi         │
                    └───────────────────┘
                                │
                                ▼ (Search)
                    ┌───────────────────┐
                    │ GET /chuyen-xe/   │
                    │     tim-kiem      │
                    └───────────────────┘
                                │
                                ▼
                    [Hiển thị danh sách chuyến]
                                │
                                ▼ (Chọn chuyến)
                    [/trip/:tripId]
                                │
                                ▼
                    ┌───────────────────┐
                    │ GET /chuyen-xe/   │
                    │     {maChuyen}    │
                    │                   │
                    │ GET /ve/          │
                    │   theo-chuyen/    │
                    │   {maChuyen}      │
                    └───────────────────┘
                                │
                                ▼
                    [Hiển thị sơ đồ ghế]
                    [Ghế trống / đã đặt]
                                │
                                ▼ (Chọn ghế)
                    [/booking?tripId=X&seatId=Y&viTri=Z]
                                │
                                ▼
                    ┌───────────────────┐
                    │ Nhập thông tin:   │
                    │ - Họ tên          │
                    │ - Số điện thoại   │
                    └───────────────────┘
                                │
                                ▼ (Xác nhận)
                    ┌───────────────────┐
                    │ POST /ve/dat-ve   │
                    │ Body:             │
                    │ - maKhach         │
                    │ - maChuyen        │
                    │ - phuongThucTT    │
                    │ - viTri           │
                    │ - maGhe           │
                    └───────────────────┘
                                │
                                ▼
                    [Đặt vé thành công]
                    [Mã vé: #123]
                                │
                                ▼
                    [/my-tickets] (Xem vé)
```

**Components liên quan:**

- [SearchTrips.tsx](../src/features/customer/pages/SearchTrips.tsx)
- [TripDetail.tsx](../src/features/customer/pages/TripDetail.tsx)
- [Booking.tsx](../src/features/customer/pages/Booking.tsx)
- [MyTickets.tsx](../src/features/customer/pages/MyTickets.tsx)

**API Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| Tìm chuyến | GET | `/chuyen-xe/tim-kiem` |
| Chi tiết chuyến | GET | `/chuyen-xe/{maChuyen}` |
| Vé theo chuyến | GET | `/ve/theo-chuyen/{maChuyen}` |
| Đặt vé | POST | `/ve/dat-ve` |
| Hủy vé | PUT | `/ve/{stt}/huy` |

### 2.3 Luồng Admin Quản lý

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

[Admin Login] ─→ [/admin/dashboard]
                        │
        ┌───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼
   [Tài xế]        [Xe]          [Chuyến xe]      [Vé]
        │               │               │               │
        ▼               ▼               ▼               ▼
┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│ Danh sách │   │ Danh sách │   │ Danh sách │   │ Danh sách │
│ CRUD      │   │ CRUD      │   │ CRUD      │   │ Xem/Hủy   │
│ Tìm kiếm  │   │ Tìm kiếm  │   │ Tìm kiếm  │   │ Tìm kiếm  │
└───────────┘   └───────────┘   └───────────┘   └───────────┘
```

**Admin Dashboard Features:**

1. **Thống kê tổng quan**: Số tài xế, xe, chuyến, vé
2. **Cảnh báo bảo trì**: Xe cần bảo trì
3. **Thao tác nhanh**: Links đến các chức năng

**Admin Pages:**
| Page | Route | Chức năng |
|------|-------|-----------|
| Dashboard | `/admin/dashboard` | Tổng quan |
| Tài xế | `/admin/drivers` | CRUD tài xế |
| Xe | `/admin/vehicles` | CRUD xe |
| Chuyến xe | `/admin/trips` | CRUD chuyến |
| Quản lý vé | `/admin/tickets` | Xem, hủy vé |
| Khách hàng | `/admin/users` | CRUD khách hàng |
| Báo cáo | `/admin/reports` | Báo cáo doanh thu |
| Bảo trì | `/admin/maintenance` | Quản lý bảo trì |

---

## 3. Mapping FE – BE

### 2.3 Cấu hình environment

Tạo file `.env` (hoặc chỉnh sửa file hiện có):

```env
VITE_API_URL=http://localhost:5000/api
VITE_FEATURE_FLAG_EXPERIMENTAL=false
```

### 2.4 Chạy development server

```bash
npm run dev
# hoặc
pnpm dev
```

Mở trình duyệt tại: `http://localhost:5173`

### 2.5 Build production

```bash
npm run build
# hoặc
pnpm build
```

### 2.6 Scripts có sẵn

| Script    | Mô tả                        |
| --------- | ---------------------------- |
| `dev`     | Chạy development server      |
| `build`   | Build production             |
| `lint`    | Kiểm tra lỗi ESLint          |
| `preview` | Preview bản build production |

---

## 3. Mapping FE – BE

### 3.1 Base Response Format

**Backend Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errorCode": null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Frontend Model:** `src/base/models/base.ts`

### 3.2 Paginated Response Format

**Backend Response:**

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

**Frontend Model:** `src/base/models/basePaginated.ts`

### 3.3 API Endpoints Mapping

| Module          | Frontend Service     | Backend Endpoint | Methods                |
| --------------- | -------------------- | ---------------- | ---------------------- |
| **Tài xế**      | `DriverService`      | `/tai-xe`        | GET, POST, PUT, DELETE |
| **Xe**          | `VehicleService`     | `/xe`            | GET, POST, PUT, DELETE |
| **Chuyến xe**   | `TripService`        | `/chuyen-xe`     | GET, POST, PUT, DELETE |
| **Vé**          | `TicketService`      | `/ve`            | GET, POST, PUT, DELETE |
| **Khách hàng**  | `CustomerService`    | `/khach-hang`    | GET, POST, PUT, DELETE |
| **Tuyến đường** | `RouteService`       | `/tuyen-duong`   | GET, POST, PUT, DELETE |
| **Bảo trì**     | `MaintenanceService` | `/bao-tri`       | GET, POST, PUT, DELETE |
| **Báo cáo**     | `ReportService`      | `/baocao/*`      | GET                    |

### 3.4 Entity Models Mapping

#### Driver (Tài xế)

| Backend Field       | Frontend Field      | Type      |
| ------------------- | ------------------- | --------- |
| id                  | id                  | number    |
| hoTen               | hoTen               | string    |
| ngaySinh            | ngaySinh            | string    |
| gioiTinh            | gioiTinh            | string    |
| diaChi              | diaChi              | string    |
| maChucVu            | maChucVu            | string    |
| luongCoBan          | luongCoBan          | number    |
| kiemNhiem           | kiemNhiem           | boolean   |
| bangLai             | bangLai             | BangLai[] |
| danhSachSoDienThoai | danhSachSoDienThoai | string[]  |

#### Vehicle (Xe)

| Backend Field | Frontend Field | Type   |
| ------------- | -------------- | ------ |
| bienSo        | bienSo         | string |
| loaiXe        | loaiXe         | string |
| sucChua       | sucChua        | number |
| trangThai     | trangThai      | string |
| namSanXuat    | namSanXuat     | number |
| tenXe         | tenXe          | string |

#### Trip (Chuyến xe)

| Backend Field | Frontend Field | Type           |
| ------------- | -------------- | -------------- |
| id            | id             | number         |
| bienSoXe      | bienSoXe       | string         |
| maTuyenDuong  | maTuyenDuong   | string         |
| ngayKhoiHanh  | ngayKhoiHanh   | string         |
| gioKhoiHanh   | gioKhoiHanh    | string         |
| trangThai     | trangThai      | string         |
| soGheTrong    | soGheTrong     | number         |
| chiTietTaiXe  | chiTietTaiXe   | ChiTietTaiXe[] |

### 3.5 React Query Keys

```typescript
// Query keys pattern: [module, ...params]
['drivers'][('drivers', id)]['vehicles'][('vehicles', params)]['trips'][('trips', params)][ // Danh sách tài xế // Chi tiết tài xế // Danh sách xe // Xe với filter // Danh sách chuyến // Chuyến với filter
  'tickets'
][('reports', 'revenue', params)]; // Danh sách vé // Báo cáo doanh thu
```

---

## 4. Quy ước phát triển

### 4.1 Cấu trúc thư mục

```
features/
└── [feature-name]/
    ├── components/     # Feature-specific components
    ├── hooks/          # Custom hooks
    ├── pages/          # Page components
    └── routes/         # Route definitions
```

### 4.2 Naming Conventions

| Type             | Convention                     | Example             |
| ---------------- | ------------------------------ | ------------------- |
| Components       | PascalCase                     | `DriverList.tsx`    |
| Hooks            | camelCase with use prefix      | `useDrivers.ts`     |
| Services         | PascalCase with Service suffix | `DriverService`     |
| Types/Interfaces | PascalCase                     | `Driver`, `Vehicle` |
| Files            | kebab-case hoặc PascalCase     | `driver.service.ts` |
| Routes           | kebab-case                     | `/admin/drivers`    |

### 4.3 Service Class Pattern

```typescript
// Kế thừa từ HttpService
export class DriverService extends HttpService {
  private static readonly BASE_PATH = '/tai-xe';

  async getAll(params?: QueryParams): Promise<BaseResponse<Driver[]>> {
    return this.get<BaseResponse<Driver[]>>(DriverService.BASE_PATH, params);
  }

  async getById(id: number): Promise<BaseResponse<Driver>> {
    return this.get<BaseResponse<Driver>>(`${DriverService.BASE_PATH}/${id}`);
  }

  async create(data: CreateDriverDto): Promise<BaseResponse<Driver>> {
    return this.post<BaseResponse<Driver>>(DriverService.BASE_PATH, data);
  }

  async update(id: number, data: UpdateDriverDto): Promise<BaseResponse<Driver>> {
    return this.put<BaseResponse<Driver>>(`${DriverService.BASE_PATH}/${id}`, data);
  }

  async delete(id: number): Promise<BaseResponse<void>> {
    return this.remove<BaseResponse<void>>(`${DriverService.BASE_PATH}/${id}`);
  }
}

export const driverService = new DriverService();
```

### 4.4 React Query Hook Pattern

```typescript
// useDrivers.ts
export const useDrivers = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driverService.getAll(params),
    select: (response) => response.data,
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverDto) => driverService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      message.success('Thêm tài xế thành công');
    },
    onError: () => {
      message.error('Có lỗi xảy ra');
    },
  });
};
```

### 4.5 Route Definition Pattern

```typescript
// features/admin/routes/drivers.route.tsx
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { adminRoute } from '@/routes/admin.routes';

const driversRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'drivers',
  component: lazyRouteComponent(() => import('../pages/drivers/DriverList')),
});

const driverDetailRoute = createRoute({
  getParentRoute: () => driversRoute,
  path: '$driverId',
  component: lazyRouteComponent(() => import('../pages/drivers/DriverDetail')),
});

export { driversRoute, driverDetailRoute };
```

### 4.6 Component Pattern với Ant Design

```tsx
const DriverList: React.FC = () => {
  const [searchParams, setSearchParams] = useState<QueryParams>({});
  const { data, isLoading, error } = useDrivers(searchParams);

  const columns: ColumnsType<Driver> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
    // ...
  ];

  if (error) {
    return <Alert type="error" message="Có lỗi xảy ra" />;
  }

  return (
    <Card title="Danh sách tài xế">
      <Table
        columns={columns}
        dataSource={data ?? []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
      />
    </Card>
  );
};
```

### 4.7 TypeScript Guidelines

- **Luôn định nghĩa type** cho props, state, và return values
- **Sử dụng interfaces** cho object shapes
- **Sử dụng type aliases** cho unions và intersections
- **Avoid `any`**, sử dụng `unknown` nếu cần
- **Export types** cần thiết từ index.ts

```typescript
// ✅ Good
interface DriverListProps {
  onSelect?: (driver: Driver) => void;
}

// ❌ Bad
interface DriverListProps {
  onSelect?: (driver: any) => void;
}
```

### 4.8 Error Handling

```typescript
// Sử dụng try-catch trong mutations
const handleSubmit = async (values: CreateDriverDto) => {
  try {
    await createDriverMutation.mutateAsync(values);
    navigate({ to: '/admin/drivers' });
  } catch (error) {
    // Error đã được handle trong hook
    console.error('Failed to create driver:', error);
  }
};

// Sử dụng error boundary cho pages
<ErrorBoundary fallback={<ErrorFallback />}>
  <DriverList />
</ErrorBoundary>
```

---

## 5. Danh sách file thay đổi

### 5.1 File mới tạo

| File Path                                            | Mô tả                                   |
| ---------------------------------------------------- | --------------------------------------- |
| `src/base/models/entities/driver.ts`                 | Type definitions cho Driver entity      |
| `src/base/models/entities/vehicle.ts`                | Type definitions cho Vehicle entity     |
| `src/base/models/entities/trip.ts`                   | Type definitions cho Trip entity        |
| `src/base/models/entities/ticket.ts`                 | Type definitions cho Ticket entity      |
| `src/base/models/entities/customer.ts`               | Type definitions cho Customer entity    |
| `src/base/models/entities/route.ts`                  | Type definitions cho Route entity       |
| `src/base/models/entities/maintenance.ts`            | Type definitions cho Maintenance entity |
| `src/base/models/entities/report.ts`                 | Type definitions cho Report entity      |
| `src/base/models/entities/index.ts`                  | Re-export tất cả entities               |
| `src/base/config/queryClient.ts`                     | React Query configuration               |
| `src/services/api/driver.service.ts`                 | API service cho Driver module           |
| `src/services/api/vehicle.service.ts`                | API service cho Vehicle module          |
| `src/services/api/trip.service.ts`                   | API service cho Trip module             |
| `src/services/api/ticket.service.ts`                 | API service cho Ticket module           |
| `src/services/api/customer.service.ts`               | API service cho Customer module         |
| `src/services/api/route.service.ts`                  | API service cho Route module            |
| `src/services/api/maintenance.service.ts`            | API service cho Maintenance module      |
| `src/services/api/report.service.ts`                 | API service cho Report module           |
| `src/services/api/index.ts`                          | Re-export tất cả API services           |
| `src/utils/format.ts`                                | Utility functions cho formatting        |
| `src/features/admin/hooks/useDrivers.ts`             | React Query hooks cho Driver            |
| `src/features/admin/hooks/useVehicles.ts`            | React Query hooks cho Vehicle           |
| `src/features/admin/hooks/useTrips.ts`               | React Query hooks cho Trip              |
| `src/features/admin/hooks/useReports.ts`             | React Query hooks cho Report            |
| `src/features/admin/hooks/useMaintenance.ts`         | React Query hooks cho Maintenance       |
| `src/features/admin/hooks/usePagination.ts`          | Custom hook cho pagination              |
| `src/features/admin/hooks/index.ts`                  | Re-export tất cả hooks                  |
| `src/features/admin/pages/drivers/DriverList.tsx`    | Trang danh sách tài xế                  |
| `src/features/admin/pages/drivers/DriverDetail.tsx`  | Trang chi tiết tài xế                   |
| `src/features/admin/pages/drivers/DriverForm.tsx`    | Form thêm/sửa tài xế                    |
| `src/features/admin/pages/drivers/index.ts`          | Re-export driver pages                  |
| `src/features/admin/pages/vehicles/VehicleList.tsx`  | Trang danh sách xe                      |
| `src/features/admin/pages/vehicles/index.ts`         | Re-export vehicle pages                 |
| `src/features/admin/pages/trips/TripList.tsx`        | Trang danh sách chuyến xe               |
| `src/features/admin/pages/trips/index.ts`            | Re-export trip pages                    |
| `src/features/admin/pages/reports/Reports.tsx`       | Trang báo cáo                           |
| `src/features/admin/pages/reports/index.ts`          | Re-export report pages                  |
| `src/features/admin/pages/tickets/TicketBooking.tsx` | Trang đặt vé                            |
| `src/features/admin/pages/tickets/index.ts`          | Re-export ticket pages                  |
| `src/features/admin/routes/drivers.route.tsx`        | Routes cho Driver module                |
| `src/features/admin/routes/vehicles.route.tsx`       | Routes cho Vehicle module               |
| `src/features/admin/routes/trips.route.tsx`          | Routes cho Trip module                  |
| `src/features/admin/routes/reports.route.tsx`        | Routes cho Report module                |
| `src/features/admin/routes/tickets.route.tsx`        | Routes cho Ticket module                |

### 5.2 File chỉnh sửa

| File Path                                        | Thay đổi                     | Lý do                                             |
| ------------------------------------------------ | ---------------------------- | ------------------------------------------------- |
| `src/base/models/base.ts`                        | Cập nhật response format     | Match với Backend API response format             |
| `src/base/models/basePaginated.ts`               | Cập nhật paginated format    | Match với Backend API paginated format            |
| `package.json`                                   | Thêm dependencies            | Cần @tanstack/react-query, date-fns, lucide-react |
| `src/App.tsx`                                    | Thêm QueryClientProvider     | Enable React Query cho toàn app                   |
| `src/routes/admin.routes.tsx`                    | Import và đăng ký routes mới | Thêm routes cho các features mới                  |
| `src/components/sidebars/admin/SidebarAdmin.tsx` | Cập nhật menu items          | Thêm navigation cho các features mới              |
| `.env`                                           | Cập nhật VITE_API_URL        | Point tới Backend API đúng                        |
| `src/constants/env.ts`                           | Nới lỏng validation          | Cho phép URL không cần protocol                   |

### 5.3 Tổng kết

| Loại           | Số lượng |
| -------------- | -------- |
| File mới       | 41       |
| File chỉnh sửa | 8        |
| **Tổng cộng**  | **49**   |

---

## Phụ lục

### A. Troubleshooting

**Lỗi: CORS Error**

```
Access to XMLHttpRequest has been blocked by CORS policy
```

→ Kiểm tra Backend đã enable CORS cho `http://localhost:5173`

**Lỗi: Network Error**

```
ERR_CONNECTION_REFUSED
```

→ Kiểm tra Backend API đang chạy tại `http://localhost:5000`

**Lỗi: 404 Not Found**

```
GET /api/tai-xe 404 Not Found
```

→ Kiểm tra endpoint URL trong Backend documentation

### B. Development Tips

1. **Sử dụng React Query Devtools** để debug queries
2. **Check Network tab** để xem request/response thực tế
3. **Sử dụng TypeScript strict mode** để catch errors sớm
4. **Chạy `npm run lint`** trước khi commit

### C. Useful Links

- [Backend API Documentation](./API_DOCUMENTATION.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Ant Design Components](https://ant.design/components/overview)
- [@tanstack/react-router](https://tanstack.com/router/latest)

---

_Tài liệu được tạo tự động bởi AI Assistant_
_Cập nhật lần cuối: 2025_
