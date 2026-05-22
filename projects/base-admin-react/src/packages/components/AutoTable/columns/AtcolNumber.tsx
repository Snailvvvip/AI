import {iAutoColumnNumber} from "./auto-table.columns";
import {InputNumber} from "antd";
import {createAutoTableColumn} from "./createAutoTableColumn";

export function AtcolNumber(col: Partial<iAutoColumnNumber>): iAutoColumnNumber {
  const dataIndex = String(col.dataIndex);
  return createAutoTableColumn<iAutoColumnNumber>({
    type: 'number',
    width: '100px',
    align: 'right',
    filterOption: {
      filterType: 'number' as const,
      filterSubType: 'range',
      field: dataIndex,
      label: String(col.title),
      filterStartField: dataIndex + 'FilterStart',
      filterEndField: dataIndex + 'FilterEnd',
    },
    inlineRender: ({ value }) => value,
    inlineEditor: () => <InputNumber/>,
    ...col,
  });
}
