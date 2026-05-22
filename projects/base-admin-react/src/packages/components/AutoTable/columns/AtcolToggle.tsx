import {iAutoColumnToggle} from "./auto-table.columns";
import {createAutoTableColumn} from "./createAutoTableColumn";
import {Switch} from "antd";
import {doNothing} from "@peryl/utils/doNothing";

export function AtcolToggle(col: Partial<iAutoColumnToggle>): iAutoColumnToggle {
  const trueValue = col.trueValue ?? 'Y';
  const falseValue = col.falseValue ?? 'N';
  return createAutoTableColumn<iAutoColumnToggle>({
    type: 'toggle' as const,
    width: '100px',
    inlineRender: ({ value }) => <Switch value={value === trueValue} onChange={doNothing}/>,
    inlineEditor: ({ form, dataIndex, rules, formData }) => (
      <span><Switch value={formData[dataIndex] === trueValue} onChange={val => {form.setFieldValue(dataIndex, val ? trueValue : falseValue);}}/></span>
    ),
    ...col,
  });

}
