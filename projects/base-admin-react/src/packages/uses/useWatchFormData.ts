import {Form} from "antd";
import {useState} from "react";


export function useWatchFormData() {
  const [form] = Form.useForm();
  const [defaultFormData] = useState(() => ({}));
  const formData = Form.useWatch(undefined, form) ?? defaultFormData;

  return { form, formData };
}
