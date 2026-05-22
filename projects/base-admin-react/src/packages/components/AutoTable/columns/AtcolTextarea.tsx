import {iAutoColumnInput} from "./auto-table.columns";
import {Input} from "antd";
import {createAutoTableColumn} from "./createAutoTableColumn";

export function AtcolTextarea(col: Partial<iAutoColumnInput>): iAutoColumnInput {
  return createAutoTableColumn<iAutoColumnInput>({
    type: 'input' as const,
    width: '200px',
    filterOption: {
      filterType: 'input' as const,
      filterSubType: 'like',
      field: String(col.dataIndex),
      label: String(col.title),
    },
    inlineRender: ({ value }) => value,
    inlineEditor: () => <Input/>,
    formEditor: () => <Input.TextArea/>,
    ...col,
  });

}
