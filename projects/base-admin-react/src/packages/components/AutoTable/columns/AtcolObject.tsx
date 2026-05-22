import {iAutoColumnObject} from "./auto-table.columns";
import {createAutoTableColumn} from "./createAutoTableColumn";
import {AutoObject} from "../components/AutoObject";

export function AtcolObject(col: Partial<iAutoColumnObject>): iAutoColumnObject {
  if (!col.config) {throw new Error('AtcolObject: missing column.config');}
  if (!col.map) {throw new Error('AtcolObject: missing column.map');}
  return createAutoTableColumn<iAutoColumnObject>({
    type: 'object' as const,
    width: '150px',
    config: col.config,
    map: col.map,
    filterOption: {
      filterType: 'input' as const,
      filterSubType: 'like',
      field: String(col.dataIndex),
      label: String(col.title),
    },
    inlineRender: ({ value }) => value,
    inlineEditor: ({ form, dataIndex, rules }) => <AutoObject config={col.config!} form={form} field={dataIndex} map={col.map!}/>,
    ...col,
  });

}
