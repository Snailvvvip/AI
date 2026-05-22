import {iFilterOption} from "../filter.utils";
import {FormInstance} from "antd/es/form/hooks/useForm";

export function clearFilterTip(filterOption: iFilterOption, form: FormInstance) {
  if (filterOption.filterType === 'number' || filterOption.filterType === 'datetime') {
    if (filterOption.filterSubType === 'range') {
      form.setFieldsValue({
        [filterOption.filterStartField]: null,
        [filterOption.filterEndField]: null,
      });
      return;
    }
  }
  form.setFieldValue(filterOption.field, null);
}
