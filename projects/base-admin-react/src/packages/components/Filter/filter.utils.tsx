import React from "react";
import {PlainObject} from "@peryl/utils/event";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {iFilterHandlerQueryParam} from "./filter.query";
import {installFilterInput} from "./types/filter.input";
import {installFilterNumber} from "./types/filter.number";
import {installFilterDatetime} from "./types/filter.datetime";
import {installFilterSelect} from "./types/filter.select";

export interface iFilterOptionBase {
  field: string,          /*筛选的字段名*/
  label: string,          /*字段显示标题*/
  // filterType: string,  /*筛选类型*/
  filterSubType: string,  /*筛选子类型*/
}

/*@formatter:off*/
export interface iFilterOptionExtender {}
export interface iFilterOptionInput extends iFilterOptionBase {filterType: 'input', }
export interface iFilterOptionNumber extends iFilterOptionBase {filterType: 'number', filterStartField: string, filterEndField: string }
export interface iFilterOptionDatetime extends iFilterOptionBase {filterType: 'datetime', showTime?: boolean, filterStartField: string, filterEndField: string }
export interface iFilterOptionSelect extends iFilterOptionBase {filterType: 'select', options: {label:string,value:string}[] }

export interface iFilterOptionExtender {input: iFilterOptionInput}
export interface iFilterOptionExtender {number: iFilterOptionNumber}
export interface iFilterOptionExtender {datetime: iFilterOptionDatetime}
export interface iFilterOptionExtender {select: iFilterOptionSelect}
/*@formatter:on*/

export type iFilterOption = iFilterOptionExtender[keyof iFilterOptionExtender]

export interface iFilterConfig<FilterType extends keyof iFilterOptionExtender> {
  filterType: FilterType,
  filterSubType: string,
  label: string,
  getDescription: (param: { value: any, formData: PlainObject, filterOption: iFilterOptionExtender[FilterType] }) => string | null,
  filterEditor: (param: { value: any, formData: PlainObject, form: FormInstance, filterOption: iFilterOptionExtender[FilterType], confirm: () => void }) => React.ReactElement,
  getQueryParam: (param: { value: any, formData: PlainObject, filterOption: iFilterOptionExtender[FilterType] }) => null | undefined | iFilterHandlerQueryParam | Promise<iFilterHandlerQueryParam>,
}

export interface iFilterTip {
  text: string,
  clear: () => void
}

export const FilterConfiguration = (() => {

  const filterConfigMapper = {} as Record<keyof iFilterOptionExtender, Record<string, iFilterConfig<any>>>;

  function addFilterSubType<FilterType extends keyof iFilterOptionExtender>(filterConfig: iFilterConfig<FilterType>) {
    if (!filterConfigMapper[filterConfig.filterType]) {
      filterConfigMapper[filterConfig.filterType] = {};
    }
    (filterConfigMapper[filterConfig.filterType] as any)[filterConfig.filterSubType] = filterConfig;
  }

  function getFilterConfig(filterType: string, filterSubType: string): iFilterConfig<any> {
    const filterConfig = (filterConfigMapper as any)[filterType]?.[filterSubType];
    if (!filterConfig) {
      throw new Error('无法识别的筛选类型：' + filterType + ':' + filterSubType);
    }
    return filterConfig;
  }

  function getSubTypes(filterType: keyof iFilterOptionExtender): iFilterConfig<any>[] {
    const ret = filterConfigMapper[filterType] ?? {};
    return Object.values(ret);
  }

  return {
    addFilterSubType,
    getFilterConfig,
    getSubTypes,
  };
})();

export type iFilterConfiguration = typeof FilterConfiguration

installFilterInput(FilterConfiguration);
installFilterNumber(FilterConfiguration);
installFilterDatetime(FilterConfiguration);
installFilterSelect(FilterConfiguration);
