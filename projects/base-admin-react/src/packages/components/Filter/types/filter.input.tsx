import {eFilterOperator} from "../filter.query";
import React from "react";
import {iFilterConfiguration} from "../filter.utils";
import {checkEmpty} from "../utils/checkEmpty";
import {Input} from "antd";
import {addFilterSubTypeNotNull, addFilterSubTypeNull} from "./addFilterSubType";

export function installFilterInput(configuration: iFilterConfiguration) {

  configuration.addFilterSubType({
    filterType: 'input',
    filterSubType: 'like',
    label: '类似于',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 类似于 ${value}`,
    filterEditor: ({ value, formData, form, filterOption, confirm }) => (
      <Input
        value={value}
        onChange={(e) => form.setFieldsValue({ [filterOption.field]: e.target.value })}
        onKeyUp={e => e.keyCode === 13 && confirm()}
      />
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { isEmpty, value, field } = checkEmpty(formData, filterOption);
      if (isEmpty) {return;}
      return { queries: [{ field, value, operator: eFilterOperator.like }] };
    },
  });

  configuration.addFilterSubType({
    filterType: 'input',
    filterSubType: 'eq',
    label: '等于',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 等于 ${value}`,
    filterEditor: ({ value, formData, form, filterOption, confirm }) => (
      <Input
        value={value}
        onChange={(e) => form.setFieldsValue({ [filterOption.field]: e.target.value })}
        onKeyUp={e => e.keyCode === 13 && confirm()}
      />
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { isEmpty, value, field } = checkEmpty(formData, filterOption);
      if (isEmpty) {return;}
      return { queries: [{ field, value, operator: eFilterOperator.eq }] };
    },
  });

  addFilterSubTypeNull(configuration, 'input');
  addFilterSubTypeNotNull(configuration, 'input');
}
