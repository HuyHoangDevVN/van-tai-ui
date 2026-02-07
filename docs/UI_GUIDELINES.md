# UI/UX Guidelines - Hệ thống Quản lý Vận tải

## 1. Design Principles

### 1.1 Minimalism

- Tối giản hóa giao diện, loại bỏ các yếu tố không cần thiết
- Mỗi màn hình chỉ tập trung vào 1-2 hành động chính
- Sử dụng negative space hiệu quả

### 1.2 Consistency

- Áp dụng thống nhất patterns trên toàn bộ ứng dụng
- Buttons, forms, tables giữ nguyên style
- Spacing, typography, colors đồng bộ

### 1.3 Feedback

- Mọi action đều có feedback rõ ràng
- Loading states cho tất cả async operations
- Success/Error messages ngắn gọn, actionable

---

## 2. Typography

### Font Family

- Primary: System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`)
- Monospace: `'SF Mono', Consolas` cho mã, số CCCD, biển số

### Font Sizes

| Element       | Size | Weight |
| ------------- | ---- | ------ |
| Page Title    | 24px | 600    |
| Section Title | 18px | 600    |
| Body          | 14px | 400    |
| Caption       | 12px | 400    |
| Button        | 14px | 500    |

### Line Height

- Headings: 1.2
- Body text: 1.5

---

## 3. Colors

### Primary Palette

```css
--primary: #1677ff; /* Ant Design Blue */
--success: #52c41a; /* Green */
--warning: #faad14; /* Orange */
--error: #ff4d4f; /* Red */
--info: #1677ff; /* Blue */
```

### Neutral Palette

```css
--text-primary: rgba(0, 0, 0, 0.88);
--text-secondary: rgba(0, 0, 0, 0.65);
--text-disabled: rgba(0, 0, 0, 0.25);
--border: #d9d9d9;
--background: #f5f5f5;
--surface: #ffffff;
```

### Status Colors

| Status  | Background | Text    |
| ------- | ---------- | ------- |
| Active  | #f6ffed    | #52c41a |
| Warning | #fffbe6    | #faad14 |
| Error   | #fff2f0    | #ff4d4f |
| Info    | #e6f4ff    | #1677ff |

---

## 4. Spacing

### Base Unit

- Base: 4px
- Use multiples: 4, 8, 12, 16, 24, 32, 48

### Common Patterns

```css
/* Page padding */
.page {
  padding: 24px;
}

/* Card spacing */
.card {
  padding: 16px;
  margin-bottom: 16px;
}

/* Section gap */
.section {
  margin-bottom: 24px;
}

/* Form item */
.form-item {
  margin-bottom: 16px;
}
```

---

## 5. Components

### 5.1 Buttons

#### Primary Actions

```tsx
<Button type="primary" icon={<PlusOutlined />}>
  Thêm mới
</Button>
```

#### Secondary Actions

```tsx
<Button icon={<EditOutlined />}>Chỉnh sửa</Button>
```

#### Danger Actions

```tsx
<Popconfirm
  title="Xác nhận xóa"
  description="Hành động này không thể hoàn tác"
  okText="Xóa"
  cancelText="Hủy"
  okButtonProps={{ danger: true }}
>
  <Button danger icon={<DeleteOutlined />}>
    Xóa
  </Button>
</Popconfirm>
```

#### Icon-only Buttons (trong Table)

```tsx
<Button type="text" size="small" icon={<EyeOutlined />} title="Xem" />
```

### 5.2 Loading States

#### ❌ Don't: Spinner

```tsx
// Tránh sử dụng Spin cho loading toàn trang
<Spin size="large" />
```

#### ✅ Do: Skeleton

```tsx
// Sử dụng Skeleton để giữ layout stability
<Skeleton active paragraph={{ rows: 4 }} />

// Table skeleton
<div className="space-y-3">
  {[1,2,3,4,5].map(i => (
    <Skeleton.Input key={i} active style={{ width: '100%' }} />
  ))}
</div>
```

### 5.3 Empty States

#### With Action

```tsx
<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài xế nào">
  <Link to="/admin/drivers/new">
    <Button type="primary" icon={<PlusOutlined />}>
      Thêm tài xế đầu tiên
    </Button>
  </Link>
</Empty>
```

#### Search Empty

```tsx
<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy kết quả phù hợp" />
```

### 5.4 Forms

#### Input với Icon

```tsx
<Input placeholder="Tìm kiếm..." prefix={<SearchOutlined className="text-gray-400" />} allowClear />
```

#### Form Validation

```tsx
<Form.Item
  name="tenTaiXe"
  label="Tên tài xế"
  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
>
  <Input placeholder="Nhập tên tài xế" />
</Form.Item>
```

### 5.5 Tables

#### Pagination

```tsx
pagination={{
  current: currentPage,
  pageSize: 20,
  total: totalRecords,
  showSizeChanger: true,
  showTotal: (total, range) => (
    <span className="text-gray-500">
      {range[0]}-{range[1]} / {total}
    </span>
  ),
}}
```

#### Actions Column

```tsx
{
  title: 'Thao tác',
  key: 'action',
  width: 120,
  align: 'center',
  render: (_, record) => (
    <Space size="small">
      <Button type="text" size="small" icon={<EyeOutlined />} />
      <Button type="text" size="small" icon={<EditOutlined />} />
      <Popconfirm {...}>
        <Button type="text" size="small" icon={<DeleteOutlined />} danger />
      </Popconfirm>
    </Space>
  ),
}
```

---

## 6. Page Layouts

### 6.1 List Page Structure

```tsx
<div className="p-6 max-w-7xl mx-auto">
  {/* Header: Title + Primary Action */}
  <div className="mb-6 flex justify-between items-start">
    <div>
      <Title level={2}>Quản lý Tài xế</Title>
      <Text type="secondary">Danh sách tất cả tài xế</Text>
    </div>
    <Button type="primary" icon={<PlusOutlined />}>
      Thêm mới
    </Button>
  </div>

  {/* Filters */}
  <Card className="!mb-4">
    <Space wrap>
      <Input placeholder="Tìm kiếm..." />
      <Select placeholder="Bộ lọc..." />
      {hasFilters && <Button>Xóa lọc</Button>}
    </Space>
  </Card>

  {/* Content */}
  <Card>{isLoading ? <Skeleton /> : isEmpty ? <Empty /> : <Table />}</Card>
</div>
```

### 6.2 Form Page Structure

```tsx
<div className="p-6 max-w-3xl mx-auto">
  {/* Header */}
  <Title level={2}>Thêm tài xế mới</Title>

  {/* Form */}
  <Card>
    <Form layout="vertical">
      {/* Form fields */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button onClick={onCancel}>Hủy</Button>
        <Button type="primary" htmlType="submit">
          Lưu
        </Button>
      </div>
    </Form>
  </Card>
</div>
```

### 6.3 Dashboard Structure

```tsx
<div className="p-6 max-w-7xl mx-auto">
  {/* Header */}
  <div className="mb-8">
    <Title level={2}>Dashboard</Title>
    <Text type="secondary">Tổng quan hệ thống</Text>
  </div>

  {/* Stats Grid */}
  <Row gutter={[16, 16]} className="mb-6">
    {/* StatCards */}
  </Row>

  {/* Content Grid */}
  <Row gutter={[16, 16]}>
    <Col xs={24} lg={14}>
      {/* Main content */}
    </Col>
    <Col xs={24} lg={10}>
      {/* Sidebar */}
    </Col>
  </Row>
</div>
```

---

## 7. Interactions

### 7.1 Search

- Debounce search input (500ms delay)
- Show loading indicator while searching
- Clear results on empty search

```tsx
const debouncedSearch = useDebounce(searchInput, 500);

useEffect(() => {
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### 7.2 Delete Confirmation

- Always use Popconfirm for delete actions
- Clear warning message
- Danger-styled confirm button

```tsx
<Popconfirm
  title="Xóa tài xế"
  description="Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác."
  okText="Xóa"
  cancelText="Hủy"
  okButtonProps={{ danger: true }}
  onConfirm={handleDelete}
>
  <Button danger>Xóa</Button>
</Popconfirm>
```

### 7.3 Form Submit

- Disable submit button while loading
- Show success message after save
- Navigate away on success

```tsx
const mutation = useMutation({
  onSuccess: () => {
    message.success('Lưu thành công');
    navigate({ to: '/admin/drivers' });
  },
  onError: () => {
    message.error('Có lỗi xảy ra');
  },
});
```

---

## 8. Accessibility

### Keyboard Navigation

- All interactive elements must be focusable
- Tab order follows visual order
- Enter/Space activates buttons

### Screen Readers

- Use semantic HTML elements
- Add `aria-label` for icon-only buttons
- Use `title` attribute for tooltips

### Color Contrast

- Text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio

---

## 9. Performance

### 9.1 Data Fetching

- Use React Query for caching
- Set appropriate staleTime (5 minutes for lists)
- Prefetch on hover when possible

### 9.2 Memoization

- Memoize table columns with useMemo
- Memoize callbacks with useCallback
- Avoid inline functions in render

### 9.3 Code Splitting

- Lazy load page components
- Use Suspense with fallback

---

## 10. File Structure

```
src/features/admin/
├── hooks/
│   ├── useDebounce.ts      # Shared debounce hook
│   ├── useDrivers.ts       # Driver CRUD hooks
│   ├── usePagination.ts    # Table pagination state
│   └── index.ts            # Export all hooks
├── pages/
│   └── drivers/
│       ├── DriverList.tsx  # List page with skeleton
│       ├── DriverForm.tsx  # Create/Edit form
│       └── index.ts        # Exports
└── components/             # Shared components
```

---

## 11. Checklist for New Pages

- [ ] Page header with title + primary action
- [ ] Filters card with debounced search
- [ ] Skeleton loading state
- [ ] Empty state with action
- [ ] Error state with retry
- [ ] Memoized table columns
- [ ] Responsive grid layout
- [ ] Delete confirmation dialog
- [ ] Success/Error messages
- [ ] Keyboard accessible
