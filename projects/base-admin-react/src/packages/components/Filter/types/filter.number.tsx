import {eFilterOperator, iFilterHandlerQueryMeta} from "../filter.query";
import React from "react";
import {iFilterConfiguration} from "../filter.utils";
import {checkEmpty} from "../utils/checkEmpty";
import {Form, InputNumber} from "antd";
import {addFilterSubTypeNotNull, addFilterSubTypeNull, defaultRangeGetDescription} from "./addFilterSubType";
import {NumberRange} from "../../NumberRange/NumberRange";

export function installFilterNumber(configuration: iFilterConfiguration) {

  configuration.addFilterSubType({
    filterType: 'number',
    filterSubType: 'range',
    label: '范围',
    getDescription: defaultRangeGetDescription,
    filterEditor: ({ value, formData, form, filterOption }) => (
      <>
        <NumberRange
          start={formData[filterOption.filterStartField]}
          onUpdateStart={(e) => {form.setFieldsValue({ [filterOption.filterStartField]: e });}}

          end={formData[filterOption.filterEndField]}
          onUpdateEnd={(e) => {form.setFieldsValue({ [filterOption.filterEndField]: e });}}

          hidden={<>
            <Form.Item name={filterOption.filterStartField} noStyle/>
            <Form.Item name={filterOption.filterEndField} noStyle/>
          </>}
        />
      </>
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const queryMetas: iFilterHandlerQueryMeta[] = [];
      const isStartEmpty = checkEmpty(formData, filterOption.filterStartField);
      if (!isStartEmpty.isEmpty) {
        queryMetas.push({
          field: filterOption.field,
          value: isStartEmpty.value,
          operator: eFilterOperator.gte,
        });
      }
      const isEndEmpty = checkEmpty(formData, filterOption.filterEndField);
      if (!isEndEmpty.isEmpty) {
        queryMetas.push({
          field: filterOption.field,
          value: isEndEmpty.value,
          operator: eFilterOperator.lte,
        });
      }
      return queryMetas.length > 0 ? { queries: queryMetas } : null;
    },
  });
  configuration.addFilterSubType({
    filterType: 'number',
    filterSubType: 'like',
    label: '类似于',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 类似于 ${value}`,
    filterEditor: ({ value, formData, form, filterOption, confirm }) => (
      <InputNumber
        value={value}
        onChange={(e) => {form.setFieldsValue({ [filterOption.field]: e });}}
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
    filterType: 'number',
    filterSubType: 'eq',
    label: '等于',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 等于 ${value}`,
    filterEditor: ({ value, formData, form, filterOption, confirm }) => (
      <InputNumber
        value={value}
        onChange={(e) => form.setFieldsValue({ [filterOption.field]: e })}
        onKeyUp={e => e.keyCode === 13 && confirm()}
      />
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { isEmpty, value, field } = checkEmpty(formData, filterOption);
      if (isEmpty) {return;}
      return { queries: [{ field, value, operator: eFilterOperator.eq }] };
    },
  });

  addFilterSubTypeNull(configuration, 'number');
  addFilterSubTypeNotNull(configuration, 'number');
}
