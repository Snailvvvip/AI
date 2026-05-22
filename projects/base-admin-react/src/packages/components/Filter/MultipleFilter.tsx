import {FilterConfiguration, iFilterOption, iFilterTip} from "./filter.utils";
import {iFilterHandlerQueryParam, mergeQueryParam} from "./filter.query";
import {PlainObject} from "@peryl/utils/event";
import React, {useImperativeHandle, useMemo, useState} from "react";
import {useWatchFormData} from "../../uses/useWatchFormData";
import {Form} from "antd";
import {FilterEditor} from "./FilterEditor";
import {clearFilterTip} from "./utils/clearFilterTip";

export const MultipleFilter = React.forwardRef<iMultipleFilterInstance, iMultipleFilterProps>((props: iMultipleFilterProps, ref) => {

  const [filterOptionList, setFilterOptionList] = useState(props.filterOptionList);
  const { formData, form } = useWatchFormData();

  const ins = useMemo((): iMultipleFilterInstance => {
    return {
      getFilterData: async () => {

        let queryParam = {};
        const filterTipList: iFilterTip[] = [];
        for (const filterOption of filterOptionList) {
          const filterConfig = FilterConfiguration.getFilterConfig(filterOption.filterType, filterOption.filterSubType);
          const newQueryParam = await filterConfig.getQueryParam({ value: formData[filterOption.field], formData, filterOption });

          const filterTipText = !newQueryParam?.queries?.length ? null : filterConfig.getDescription({ value: formData[filterOption.field], formData, filterOption });
          if (!!filterTipText) {
            filterTipList.push({ text: filterTipText, clear: () => {clearFilterTip(filterOption, form);} });
          }
          queryParam = mergeQueryParam(queryParam, newQueryParam);
        }

        return {
          formData,
          filterOptionList,
          queryParam,
          filterTipList,
        };
      },
    };
  }, [filterOptionList, formData, form]);

  useImperativeHandle(ref, () => ins);

  return (
    <Form form={form}>
      {filterOptionList.map((filterOption, index) => (
        <div
          key={filterOption.field}
          className="multiple-filter-item"
        >
          <label style={{ width: '100px', display: 'inline-block', flexShrink: 0, textAlignLast: 'justify', }}>{filterOption.label}</label>
          <span style={{ display: 'inline-block', padding: '0 1em' }}>:</span>
          <FilterEditor
            value={filterOption}
            onChange={newFilterOption => {
              setFilterOptionList(prevList => {
                prevList = [...prevList];
                prevList[index] = newFilterOption;
                return prevList;
              });
            }}
            formData={formData}
            form={form}
            handleConfirm={props.onSearch}
          />
        </div>
      ))}
    </Form>
  );
});

export interface iMultipleFilterProps {
  filterOptionList: iFilterOption[],
  onSearch?: () => void,
}

export interface iMultipleFilterInstance {
  getFilterData: () => Promise<{
    queryParam: iFilterHandlerQueryParam | null | undefined,
    formData: PlainObject,
    filterOptionList: iFilterOption[],
    filterTipList: iFilterTip[]
  }>;
}
