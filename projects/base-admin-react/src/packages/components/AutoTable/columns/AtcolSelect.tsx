import {iAutoColumnSelect} from "./auto-table.columns";
import {Form, Select} from "antd";
import {createAutoTableColumn} from "./createAutoTableColumn";
import {getRowsMapper} from "../auto-table.utils";

export function AtcolSelect(col: Partial<iAutoColumnSelect>): iAutoColumnSelect {

  const options = col.options?.map(item => (typeof item === "string" ? { label: item, value: item } : item)) ?? [];
  const value2label = getRowsMapper(options.map(i => ({ id: i.value, label: i.label })), item => item.label);

  return createAutoTableColumn<iAutoColumnSelect>({
    type: 'select',
    options,
    width: '120px',
    filterOption: {
      filterType: 'select' as const,
      filterSubType: 'in',
      field: String(col.dataIndex),
      label: String(col.title),
      options: options,
    },
    getFilterText: (value) => {
      if (Array.isArray(value)) {
        return value.map(val => value2label[val] ?? val).join(',');
      } else {
        return value2label[value] ?? value;
      }
    },
    inlineRender: ({ value }) => {
      // eslint-disable-next-line eqeqeq
      const matchItem = options?.find((item) => typeof item === "string" ? item == value : item.value == value);
      return matchItem?.label ?? value;
    },
    inlineEditor: ({ formData, form, dataIndex, rules }) => {
      return (
        <Form.Item name={dataIndex} noStyle rules={rules}>
          <Select allowClear>
            {options?.map(item => (
              <Select.Option value={item.value} key={item.value ?? '_'}>{item.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    },
    ...col,
  });
}
