import React from 'react';
import { Table } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';

export interface BaseAntTableProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  data: T[];
  rowKey?: TableProps<T>['rowKey'];
}

export function BaseAntTable<T extends object>({
  columns,
  data,
  rowKey = 'id',
  ...rest
}: BaseAntTableProps<T>) {
  return <Table columns={columns} dataSource={data} rowKey={rowKey} {...rest} />;
}
