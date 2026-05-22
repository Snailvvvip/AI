import {iAutoColumnText} from "./auto-table.columns";
import {createAutoTableColumn} from "./createAutoTableColumn";

export function AtcolText(col: Partial<iAutoColumnText>): iAutoColumnText {
  return createAutoTableColumn<iAutoColumnText>({
    type: 'text' as const,
    width: '120px',
    filterOption: {
      filterType: 'input' as const,
      filterSubType: 'like',
      field: String(col.dataIndex),
      label: String(col.title),
    },
    inlineRender: ({ value }) => value,
    editable: false,
    ...col,
  });

}
