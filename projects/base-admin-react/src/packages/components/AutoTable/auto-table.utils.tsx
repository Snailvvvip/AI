import {PlainObject} from "@peryl/utils/event";
import React from "react";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {iAutoColumnType} from "./columns/auto-table.columns";
import {iCopilotDrawer} from "../../uses/useCopilotDrawer";
import {iAutoFormDrawer} from "./useAutoFormDrawer";

/*---------------------------------------types-------------------------------------------*/

/*AutoOption内部运行时会自动设置默认值的内部属性*/
export interface iAutoOptionInnerConfig {
  /*页大小*/
  pageSize: number,
  /*自动初始化数据*/
  loadOnStart: boolean,
  /*点击行的时候就选中数据（单选）*/
  selectRowOnClick: boolean,
  /*查询完毕的时候选中数据（单选）*/
  selectRowOnLoad: boolean,
  /*点击行的时候选中数据（多选）*/
  checkRowOnClick: boolean,
  /*显示编辑按钮*/
  showEditButton: boolean,
  /*显示删除按钮*/
  showDeleteButton: boolean,
  /*显示新建按钮*/
  showCreateButton: boolean,
  /*显示复制按钮*/
  showCopyButton: boolean,
  /*显示操作列*/
  showOperateColumn: boolean,
  /*双击行的时候开启编辑状态*/
  editRowOnDblClick: boolean,
}

/*AutoOption内部运行时，只根据外部传入的config来决定初始值属性*/
export interface iAutoOptionOuterConfig {
  /*对应后端通用模块地址*/
  module: string,
  /*字段信息*/
  columns: iAutoColumnType[],
  /*选择列类型：single单选，multiple多选*/
  selectType?: 'single' | 'multiple',
  /*自定义渲染操作栏内容*/
  operations?: (record: PlainObject, index: number) => React.ReactNode,
  /*默认新建行数据*/
  defaultNewRow?: PlainObject | (() => PlainObject | Promise<PlainObject>),
  /*新建的行数据是否需要自动获取一个id*/
  defaultNewRowId?: boolean,
  /*自定义按钮*/
  buttons?: { label?: string, onClick?: () => void, render?: () => React.ReactElement }[],
  /*排序字段*/
  sortField?: string,
  /*排序方式*/
  sortDesc?: boolean,
  /*父表option*/
  parentOption?: iAutoOption,
  /*父表字段映射*/
  parentKeyMap?: Record<string, string>,
  /*查询参数*/
  queryParam?: PlainObject | (() => Promise<PlainObject>),
  /*新建按钮文本内容*/
  createButtonText?: string,
  /*自定义处理新建按钮点击处理逻辑*/
  handleCreate?: () => void | Promise<void>,
}

/*调用useAutoOption的时候的config类型*/
export type iAutoOptionConfig = iAutoOptionOuterConfig & Partial<iAutoOptionInnerConfig>

/*在option中使用时的config类型*/
export type iAutoOptionRunningConfig = iAutoOptionOuterConfig & iAutoOptionInnerConfig;


export interface iAutoTempColumnConfig {
  title: string,
  field: string,
  type: string,
  width: number,
  minWidth: number,
  fixed: 'left' | 'center' | 'right',
  seq: number,
}

export interface iAutoOption {
  config: iAutoOptionConfig,
  setConfig: React.Dispatch<React.SetStateAction<iAutoOptionConfig>>,
  copilot: iCopilotDrawer;
  drawer: iAutoFormDrawer,
}

export interface iAutoTableProps {
  option: iAutoOption,
}

/*auto option中 render list的渲染配置对象类型*/
export interface iAutoOptionRenderConfig {
  key: string,
  seq: number,
  render: React.ReactNode
}

export interface iAutoOptionSortData {
  field: string,
  desc: boolean
}

/*---------------------------------------utils-------------------------------------------*/

export function createTableHook<T>() {
  type FN = (param: T) => void | T | Promise<void | T>
  const fnList: FN[] = [];

  const on = (fn: FN) => {
    fnList.push(fn);
    return () => off(fn);
  };

  const off = (fn: FN) => {
    const index = fnList.indexOf(fn);
    index - 1 && fnList.splice(index, 1);
  };

  const exec = async (param: T): Promise<T> => {
    for (const fn of fnList) {
      param = (await fn(param)) ?? param;
    }
    return param;
  };

  return { on, off, exec };
}

/*将rows对象数组转化为一个mapper对象，key为每条数据的id，value通过getValue函数获取*/
export function getRowsMapper<T>(rows: PlainObject[], getValue: (item: PlainObject) => T = (() => true as any)) {
  // eslint-disable-next-line no-sequences
  return rows.reduce((prev, item) => (prev[item.id] = getValue(item), prev), {} as Record<string, T>);
}

/*移除掉obj中对应的keys*/
export function omit<T extends PlainObject, K extends keyof T>(obj: T, keys: K[]) {
  const newObj = { ...obj };
  keys.forEach(key => delete newObj[key]);
  return newObj;
}

/*---------------------------------------react context-------------------------------------------*/

/*AutoTableRow从AutoOption注入得到的内容*/
export interface iAutoTableRowInjectContextValue {
  stateEditIdMapper: Record<string, true | undefined>,
  formInstanceManager: WeakMap<PlainObject, FormInstance>,
}

/*autoOption将stateEditData（对象数组）透传给子孙组件的上下文对象*/
export const AutoTableRowInjectContext = React.createContext<iAutoTableRowInjectContextValue>({
  stateEditIdMapper: {},
  formInstanceManager: new WeakMap(),
});

/*AutoTableRow向子孙组件透传的值类型*/
export interface iAutoTableRowProvideContextValue {
  editable: boolean,
  form: FormInstance,
  formData: PlainObject,
}

/*AutoTableRow将autoTableRowEditable（布尔值）透传给子孙组件的上下文对象*/
export const AutoTableRowProvideContext = React.createContext<iAutoTableRowProvideContextValue>(undefined as any);

/*AutoOption透传上下文对象*/
export const AutoOptionProvideContext = React.createContext<iAutoOption | null>(null);
