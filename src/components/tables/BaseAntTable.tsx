import React from 'react';
import { Table, Grid } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';

const { useBreakpoint } = Grid;

export interface BaseAntTableProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  rowKey?: TableProps<T>['rowKey'];
  mobileColumns?: ColumnsType<T>; // Optional columns for mobile view
}

export function BaseAntTable<T extends object>({
  columns,
  data,
  rowKey = 'id',
  mobileColumns,
  scroll,
  ...rest
}: BaseAntTableProps<T>) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Use mobile columns if provided and on mobile
  const displayColumns = isMobile && mobileColumns ? mobileColumns : columns;

  return (
    <div className="responsive-table-wrapper">
      <Table
        columns={displayColumns}
        dataSource={data}
        rowKey={rowKey}
        scroll={{ x: 'max-content', ...scroll }}
        size={isMobile ? 'small' : 'middle'}
        {...rest}
      />
    </div>
  );
}
