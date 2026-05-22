import {ColumnType} from "antd/es/table";

export function ColNumber(title: string, dataIndex: string | string[], column?: ColumnType): ColumnType {
  return {
    title,
    dataIndex,
    width: '100px',
    ...column
  };
}
