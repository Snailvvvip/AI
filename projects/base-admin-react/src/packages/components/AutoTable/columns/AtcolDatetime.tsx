import {iAutoColumnDatetime} from "./auto-table.columns";
import {DatePicker} from "antd";
import {createAutoTableColumn} from "./createAutoTableColumn";
import dayjs from "dayjs";

export function AtcolDatetime(col: Partial<iAutoColumnDatetime>): iAutoColumnDatetime {

  const dataIndex = String(col.dataIndex);

  const getFormItemProps: iAutoColumnDatetime['getFormItemProps'] = () => ({
    getValueProps: (value) => ({ value: value ? dayjs(value) : null }),
    getValueFromEvent: (date) => date ? dayjs(date).format(col.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD') : null,
  });

  return createAutoTableColumn<iAutoColumnDatetime>({
    type: 'datetime' as const,
    width: '150px',
    filterOption: {
      filterType: 'datetime' as const,
      filterSubType: 'range',
      field: String(col.dataIndex),
      label: String(col.title),
      showTime: col.showTime,
      filterStartField: dataIndex + 'FilterStart',
      filterEndField: dataIndex + 'FilterEnd',
    },
    inlineRender: ({ value }) => value,
    getFormItemProps,
    inlineEditor: () => <DatePicker showTime={col.showTime}/>,
    ...col,
  });

}
