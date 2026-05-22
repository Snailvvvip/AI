import {eFilterOperator, iFilterHandlerQueryMeta} from "../filter.query";
import React from "react";
import {iFilterConfiguration} from "../filter.utils";
import {checkEmpty} from "../utils/checkEmpty";
import {DatePicker, Form} from "antd";
import {addFilterSubTypeNotNull, addFilterSubTypeNull, defaultRangeGetDescription} from "./addFilterSubType";
import dayjs from "dayjs";

export function installFilterDatetime(configuration: iFilterConfiguration) {

  configuration.addFilterSubType({
    filterType: 'datetime',
    filterSubType: 'range',
    label: '范围',
    getDescription: defaultRangeGetDescription,
    filterEditor: ({ formData, form, filterOption }) => (
      <>
        <DatePicker.RangePicker
          showTime={filterOption.showTime}
          value={(() => {
            const startValue = formData[filterOption.filterStartField];
            const endValue = formData[filterOption.filterEndField];
            return [startValue == null ? null : dayjs(startValue), endValue == null ? null : dayjs(endValue)];
          })()}
          onChange={(_arr) => {
            const [startDayjs, endDayjs] = _arr ?? [];
            const formatString = filterOption.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
            form.setFieldsValue({
              [filterOption.filterStartField]: !startDayjs ? null : startDayjs.format(formatString),
              [filterOption.filterEndField]: !endDayjs ? null : endDayjs.format(formatString),
            });
          }}
        />
        <Form.Item name={filterOption.filterStartField} noStyle/>
        <Form.Item name={filterOption.filterEndField} noStyle/>
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
    filterType: 'datetime',
    filterSubType: 'eq',
    label: '等于',
    getDescription: ({ value, filterOption }) => `${filterOption.label} 等于 ${value}`,
    filterEditor: ({ value, formData, form, filterOption }) => (
      <div>
        <DatePicker
          showTime={filterOption.showTime}
          value={value == null ? null : dayjs(value)}
          onChange={(e) => form.setFieldsValue({ [filterOption.field]: e?.format(filterOption.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD') })}
        />
      </div>
    ),
    getQueryParam: ({ formData, filterOption }) => {
      const { isEmpty, value, field } = checkEmpty(formData, filterOption);
      if (isEmpty) {return;}
      return { queries: [{ field, value, operator: eFilterOperator.eq }] };
    },
  });

  addFilterSubTypeNull(configuration, 'datetime');
  addFilterSubTypeNotNull(configuration, 'datetime');
}
