import {iAutoColumnInput} from "./auto-table.columns";
import {Input} from "antd";
import {createAutoTableColumn} from "./createAutoTableColumn";

export function AtcolInput(col: Partial<iAutoColumnInput>): iAutoColumnInput {
  return createAutoTableColumn<iAutoColumnInput>({
    type: 'input' as const,
    width: '120px',
    filterOption: {
      filterType: 'input' as const,
      filterSubType: 'like',
      field: String(col.dataIndex),
      label: String(col.title),
    },
    inlineRender: ({ value }) => value,
    inlineEditor: () => <Input/>,
    ...col,
  });

}
