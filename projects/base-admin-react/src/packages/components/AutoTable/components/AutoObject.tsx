import {Form, Input} from "antd";
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import {iAutoOptionConfig} from "../auto-table.utils";
import {usePickAutoObject} from "./usePickAutoObject";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {PlainObject} from "@peryl/utils/event";

export const AutoObject = (props: {
  title?: string,
  placeholder?: string,
  config: () => iAutoOptionConfig,

  form: FormInstance,
  field: string | ((formData: PlainObject) => string),
  map: Record<string, string> | ((selectRecord: PlainObject) => void),

  onSelect?: (selectedRow: any) => void
  onChange?: (newRow: any) => void,
}) => {

  const formData = Form.useWatch(undefined, props.form) ?? {};

  const { pickSingleObject } = usePickAutoObject();

  const handleClick = async () => {
    try {
      const selectRecord = await pickSingleObject({ config: props.config });
      props.onSelect?.(selectRecord);
      const newRow = { ...formData };
      if (typeof props.map === "function") {
        props.map(selectRecord);
      } else {
        Object.entries(props.map).forEach(([originRowKey, selectRowKey]) => {
          newRow[originRowKey] = selectRecord[selectRowKey];
        });
        props.onChange?.(newRow);
        props.form.setFieldsValue(newRow);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Input
      readOnly
      value={typeof props.field === "function" ? props.field(formData) : formData[props.field]}
      suffix={<>
        <SearchOutlined/>
        {Object.keys(props.map).map(key => (<Form.Item noStyle name={key} key={key}/>))}
      </>}
      onClick={handleClick}
      placeholder={props.placeholder ?? '请选择'}
    />
  );
};
