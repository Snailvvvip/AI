import {ColumnType} from "antd/es/table";

export function ColDatePicker(title: string, dataIndex: string | string[], column?: ColumnType): ColumnType {
  return {
    title,
    dataIndex,
    width: '180px',
    ...column,
  };
}
