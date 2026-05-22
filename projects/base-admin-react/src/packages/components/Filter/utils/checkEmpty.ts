import {PlainObject} from "@peryl/utils/event";
import {iFilterOption} from "../filter.utils";

/**
 * 判断是否有值
 * @author  韦胜健
 * @date    2023.1.4 22:47
 */
export const checkEmpty = (formData: PlainObject, fieldOrOption: iFilterOption | string | undefined):
  {
    value: any
  } &
  ({ isEmpty: true, field: string | undefined } |
    { isEmpty: false, field: string }) => {
  let isEmpty = false;
  const field: string | undefined = typeof fieldOrOption === "object" ? fieldOrOption.field : fieldOrOption;
  if (!field) {
    return {
      isEmpty: true,
      value: null,
      field: undefined,
    };
  }
  const value = !field ? null : formData[field];
  if (value == null) {isEmpty = true;}
  if (typeof value === "string" && (!value || !value.trim())) {isEmpty = true;}
  if (Array.isArray(value) && value.length === 0) {isEmpty = true;}
  return {
    isEmpty,
    value,
    field,
  };
};
