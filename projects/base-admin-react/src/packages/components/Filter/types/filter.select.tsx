import {eFilterOperator} from "../filter.query";
import React from "react";
import {iFilterConfiguration, iFilterOptionSelect} from "../filter.utils";
import {checkEmpty} from "../utils/checkEmpty";
import {Select} from "antd";
import {addFilterSubTypeNotNull, addFilterSubTypeNull} from "./addFilterSubType";
import {toArray} from "@peryl/utils/toArray";

export function installFilterSelect(configuration: iFilterConfiguration) {

  configuration.addFilterSubType({
    filterType: 'select',
    filterSubType: 'in',
    label: '包含',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 包含 ${getSelectDescription(value, filterOption)}`,
    filterEditor: ({ value, formData, form, filterOption }) => (
      <Select allowClear style={{ minWidth: '120px' }} value={value} onChange={(e) => form.setFieldsValue({ [filterOption.field]: e })} mode="multiple">
        {filterOption.options.map(i => (
          <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>
        ))}
      </Select>
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { isEmpty, value, field } = checkEmpty(formData, filterOption);
      if (isEmpty) {return;}
      return { queries: [{ field, value, operator: eFilterOperator.in }] };
    },
  });

  configuration.addFilterSubType({
    filterType: 'select',
    filterSubType: 'not_in',
    label: '不包含',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 不包含 ${getSelectDescription(value, filterOption)}`,
    filterEditor: ({ value, formData, form, filterOption }) => (
      <Select allowClear style={{ minWidth: '120px' }} value={value} onChange={(e) => form.setFieldsValue({ [filterOption.field]: e })} mode="multiple">
        {filterOption.options.map(i => (
          <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>
        ))}
      </Select>
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { isEmpty, value, field } = checkEmpty(formData, filterOption);
      if (isEmpty) {return;}
      return { queries: [{ field, value, operator: eFilterOperator.not_in }] };
    },
  });

  addFilterSubTypeNull(configuration, 'select');
  addFilterSubTypeNotNull(configuration, 'select');
}

function getSelectDescription(value: any, filterOption: iFilterOptionSelect) {
  return toArray(value ?? [])
    .map(i => {
      const opt = (filterOption.options as any[]).find(opt => typeof opt === "string" ? opt === i : opt.value === i);
      if (!opt) {return String(i);}
      return typeof opt === "string" ? opt : opt.label;
    }).join(',');
}
