import {AutoTableCell} from "../components/AutoTableCell";
import {AutoTableTitle} from "../components/AutoTableTitle";
import {iAutoColumnType} from "./auto-table.columns";

export function createAutoTableColumn<Col extends iAutoColumnType>(col: Col, config?: { checkDataIndex?: boolean }): Col {

  const { dataIndex, title: originTitle } = col;

  if (config?.checkDataIndex !== false) {
    if (typeof dataIndex !== "string") {throw new Error(`AutoTableColumn[${col.type}]: dataIndex 必须为字符串`);}
  }

  col = {
    sortable: true,
    maxShowLen: 30,
    render: (value, record, index) => (
      <AutoTableCell
        column={col}
        value={value}
        record={record}
        index={index!}
        dataIndex={dataIndex as string}
      />
    ),
    ...col,
    originTitle,
    title: (props: any) => (<AutoTableTitle column={col} {...props} originTitle={originTitle}/>),
  };

  return col;
}
