import {TableColumnType} from "antd";
import {PlainObject} from "@peryl/utils/event";
import React, {useMemo} from "react";
import {FormInstance} from "antd/es/form/hooks/useForm";
import type {Rule} from "rc-field-form/lib/interface";
import {iFilterOption} from "../../Filter/filter.utils";
import {iAutoOptionConfig} from "../auto-table.utils";
import {FormItemProps} from "antd/es/form/FormItem";

/*---------------------------------------base column types-------------------------------------------*/

export interface iAutoColumnType extends TableColumnType {
  /*标记字段类型*/
  type: string,
  /*字段的显示顺序，左小右大*/
  seq?: number,
  /*非编辑状态下的渲染函数*/
  inlineRender: (param: { value: any, record: PlainObject, index: number, dataIndex: string, }) => React.ReactNode;
  /*行内编辑状态下的渲染函数*/
  inlineEditor?: (param: iAutoColumnEditParam) => React.ReactNode,
  /*表单编辑状态下的渲染函数*/
  formEditor?: (param: iAutoColumnEditParam) => React.ReactNode,
  /*渲染FormItem时额外的参数类型*/
  getFormItemProps?: (param: iAutoColumnEditParam & { drawer: boolean }) => FormItemProps,
  /*是否为标准列（单选列、多选列、操作列、索引列）*/
  standard?: boolean,
  /*是否必填*/
  required?: boolean,
  /*自定义校验规则*/
  rules?: Rule[] | ((formData: PlainObject) => Rule[]),
  /*控制是否可编辑*/
  editable?: boolean | ((record: PlainObject, index: number) => boolean),
  /*字段是否可以排序*/
  sortable?: boolean,
  /*字段标题*/
  originTitle?: string,
  /*筛选配置信息*/
  filterOption?: iFilterOption,
  /*最大显示文本长度*/
  maxShowLen?: number,
  /*将值转化为筛选条件显示值*/
  getFilterText?: (value: any) => string | Promise<string>
}

export interface iAutoColumnEditParam {
  record: PlainObject,
  index: number,
  formData: PlainObject,
  form: FormInstance,
  dataIndex: string,
  rules: Rule[] | undefined,
}

/*---------------------------------------standard column types-------------------------------------------*/

/*index*/
export interface iAutoColumnIndex extends iAutoColumnType {type: 'index';}

/*check*/
export interface iAutoColumnCheck extends iAutoColumnType {type: 'check';}

/*operate*/
export interface iAutoColumnOperate extends iAutoColumnType {type: 'operate';}

/*---------------------------------------edit column types-------------------------------------------*/

/*text不可编辑文本列*/
export interface iAutoColumnText extends iAutoColumnType {type: 'text';}

/*input文本列*/
export interface iAutoColumnInput extends iAutoColumnType {type: 'input';}

/*number 数字列*/
export interface iAutoColumnNumber extends iAutoColumnType {type: 'number';}

/*datetime 日期时间列*/
export interface iAutoColumnDatetime extends iAutoColumnType {
  type: 'datetime';
  showTime?: boolean,
}

/*select选择列*/
export interface iAutoColumnSelect extends iAutoColumnType {
  type: 'select',
  options: (string[]) | ({ label: string, value: any }[]);
}

/*object 对象列*/
export interface iAutoColumnObject extends iAutoColumnType {
  type: 'object';
  config: () => iAutoOptionConfig,
  map: Record<string, string>,
}

/*object 对象列*/
export interface iAutoColumnToggle extends iAutoColumnType {
  type: 'toggle';
  trueValue?: any,
  falseValue?: any,
}

/*---------------------------------------column utils-------------------------------------------*/

/*inlineEditor 与 formEditor的公共处理逻辑*/
export function useCellEdit(
  { column, rowEditable, record, index }: {
    column: iAutoColumnType, rowEditable: boolean, record: PlainObject, index: number
  }) {
  /*计算字段是否可编辑*/
  const isEditable = useMemo(() => {
    if (column.editable == null) {return rowEditable;}
    const columnEditable = typeof column.editable === 'function' ? column.editable(record, index) : column.editable;
    if (!columnEditable) {return false;}
    return rowEditable;
  }, [rowEditable, column, record, index]);

  /*统一处理一下必填校验规则*/
  const rules = useMemo((): Rule[] | undefined => {
    const columnRules = typeof column.rules === 'function' ? column.rules(record) : column.rules;
    if (!column.required) {return columnRules;}
    const requiredRule: Rule = { required: true, message: `${column.originTitle} 不能为空` };
    if (!column.rules) {return [requiredRule];}
    return [requiredRule, ...columnRules ?? []];
  }, [column, record]);

  return { isEditable, rules };
}

/*获取字段的描述提示词*/
export const getAutoColumnsPrompt = (columns: iAutoColumnType[]) => {
  return columns.map(col => {
    if (col.type === 'input' || col.type === 'text') {
      return `字段名：${col.title}，字段标识：${String(col.dataIndex)}，说明：数据类型为文本`;
    }
    if (col.type === 'number') {
      return `字段名：${col.title}，字段标识：${String(col.dataIndex)}，说明：数据类型为数字`;
    }
    if (col.type === 'datetime') {
      const _col = col as iAutoColumnDatetime;
      return `字段名：${col.title}，字段标识：${String(col.dataIndex)}，说明：数据类型为${_col.showTime ? '日期时间' : '日期'}，格式为${_col.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}`;
    }
    if (col.type === 'select') {
      const _col = col as iAutoColumnSelect;
      return `字段名：${col.title}，字段标识：${String(col.dataIndex)}，说明：数据类型为下拉选择，选项为${JSON.stringify(_col.options)}，需要你提取选项值`;
    }
    if (col.type === 'object') {
      /*对象字段不提取*/
      return '';
    }
    throw new Error(`未知字段类型：${col.type}`);
  }).join('\n');
};
