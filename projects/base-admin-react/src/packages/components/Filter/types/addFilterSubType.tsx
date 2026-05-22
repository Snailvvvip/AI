import {Input} from "antd";
import {checkEmpty} from "../utils/checkEmpty";
import {eFilterOperator} from "../filter.query";
import React from "react";
import {iFilterConfiguration, iFilterOptionDatetime, iFilterOptionExtender, iFilterOptionNumber} from "../filter.utils";
import {PlainObject} from "@peryl/utils/event";

export function addFilterSubTypeNull(configuration: iFilterConfiguration, filterType: keyof iFilterOptionExtender) {
  configuration.addFilterSubType({
    filterType: filterType,
    filterSubType: 'is_null',
    label: '为空',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 为空`,
    filterEditor: ({ value, formData, form, filterOption }) => (
      <Input placeholder="为空"/>
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { value, field } = checkEmpty(formData, filterOption);
      if (!field) {return null;}
      return { queries: [{ field, value, operator: eFilterOperator.is_null }] };
    },
  });
}

export function addFilterSubTypeNotNull(configuration: iFilterConfiguration, filterType: keyof iFilterOptionExtender) {
  configuration.addFilterSubType({
    filterType: filterType,
    filterSubType: 'is_not_null',
    label: '不为空',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 不为空`,
    filterEditor: ({ value, formData, form, filterOption }) => (
      <Input placeholder="不为空"/>
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { value, field } = checkEmpty(formData, filterOption);
      if (!field) {return null;}
      return { queries: [{ field, value, operator: eFilterOperator.is_not_null }] };
    },
  });
}

/**
 * 默认的范围类型的handler的getDescription函数
 * @author  韦胜健
 * @date    2023.1.14 23:52
 */
export const defaultRangeGetDescription = ({ formData, filterOption }: { formData: PlainObject, filterOption: iFilterOptionNumber | iFilterOptionDatetime }) => {
  const start = !formData[filterOption.filterStartField] ? null : `大于${formData[filterOption.filterStartField]}`;
  const end = !formData[filterOption.filterEndField] ? null : `小于${formData[filterOption.filterEndField]}`;
  if (!start && !end) {return null;}
  return filterOption.label + ` ` + [start, end].filter(Boolean).join(` 并且 `);
};
