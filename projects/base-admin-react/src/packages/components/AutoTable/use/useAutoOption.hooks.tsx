import React, {useState} from "react";
import {createTableHook, iAutoOption} from "../auto-table.utils";
import {PlainObject} from "@peryl/utils/event";
import {AxiosRequestConfig} from "axios";
import {iAutoColumnType} from "../columns/auto-table.columns";

export function useAutoOptionHooks(option: iAutoOption) {
  /*汇总所有的钩子函数*/
  const [hooks] = useState(() => ({
    /*点击行*/
    onClickRow: createTableHook<{ record: PlainObject, index: number | undefined, e: React.MouseEvent }>(),
    /*双击行*/
    onDblClickRow: createTableHook<{ record: PlainObject, index: number | undefined, e: React.MouseEvent }>(),
    /*点击列标题*/
    onClickTitle: createTableHook<{ column: iAutoColumnType, e: React.MouseEvent }>(),
    /*单选选中行变化*/
    onSelectRowChange: createTableHook<{ record: PlainObject | null | undefined }>(),

    /*请求前的请求参数处理钩子*/
    onQueryParam: createTableHook<{ queryParam: any }>(),
    /*加载数据之间*/
    onBeforeLoad: createTableHook<{ requestConfig: AxiosRequestConfig }>(),
    /*行数据加载完毕*/
    onAfterLoad: createTableHook<{ data: PlainObject[] }>(),

    /*插入数据之前*/
    onBeforeInsert: createTableHook<{ record: PlainObject, requestConfig: AxiosRequestConfig }>(),
    /*保存新建之后*/
    onAfterInsert: createTableHook<{ result: PlainObject, responseData: any }>(),
    /*更新数据之前*/
    onBeforeUpdate: createTableHook<{ record: PlainObject, requestConfig: AxiosRequestConfig }>(),
    /*保存更新之后*/
    onAfterUpdate: createTableHook<{ result: PlainObject, responseData: any }>(),
    /*删除数据之前*/
    onBeforeDelete: createTableHook<{ record: PlainObject, requestConfig: AxiosRequestConfig }>(),
    /*删除数据之后*/
    onAfterDelete: createTableHook<{ responseData: any }>(),
  }));
  return hooks;
}

export type iAutoOptionHooks = ReturnType<typeof useAutoOptionHooks>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    hooks: iAutoOptionHooks;
  }
}
