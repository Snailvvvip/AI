import {ColumnType} from "antd/es/table";

export function ColTextarea(title: string, dataIndex: string | string[], column?: ColumnType): ColumnType {
  return {
    title,
    dataIndex,
    width: undefined,
    ...column,
  };
}
