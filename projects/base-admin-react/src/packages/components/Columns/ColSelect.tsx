import {ColumnType} from "antd/es/table";


export function ColSelect(title: string, dataIndex: string | string[], options: string[] | ({ label: string, value: string }[]), column?: ColumnType): ColumnType {
  return {
    title,
    dataIndex,
    width: '180px',
    render: (value) => {
      return <span>{
        (options as any).find((i: string | { label: string, value: string }) => {
          const val = typeof i === "string" ? i : i.value;
          return value === val;
        })?.label ?? value
      }</span>;
    },
    ...column,
  };
}
