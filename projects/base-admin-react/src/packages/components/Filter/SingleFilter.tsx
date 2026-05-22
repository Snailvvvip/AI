import {FilterConfiguration, iFilterOption, iFilterTip} from "./filter.utils";
import {useWatchFormData} from "../../uses/useWatchFormData";
import React, {useCallback, useImperativeHandle, useMemo, useState} from "react";
import {Button, Form, Select} from "antd";
import {FilterEditor} from "./FilterEditor";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import {iFilterHandlerQueryParam} from "./filter.query";
import {PlainObject} from "@peryl/utils/event";
import {clearFilterTip} from "./utils/clearFilterTip";

export const SingleFilter = React.forwardRef<iSingleFilterInstance, iSingleFilterProps>((props: iSingleFilterProps, ref) => {

    const { formData, form } = useWatchFormData();
    const [filterOption, setFilterOption] = useState(() => props.filterOptionList[0] as iFilterOption | undefined);

    const getFilterData: iSingleFilterInstance['getFilterData'] = useCallback(async () => {
      if (!filterOption) {return { queryParam: null, formData, filterOption, filterTip: undefined };}
      const filterConfig = FilterConfiguration.getFilterConfig(filterOption.filterType, filterOption.filterSubType);
      const queryParam = await filterConfig.getQueryParam({ value: formData[filterOption.field], formData, filterOption });
      const filterTipText = !queryParam?.queries?.length ? null : filterConfig.getDescription({ value: formData[filterOption.field], formData, filterOption });
      return { queryParam, formData, filterOption, filterTip: !filterTipText ? null : { text: filterTipText, clear: () => {clearFilterTip(filterOption, form);} } };
    }, [filterOption, formData, form]);

    const ins = useMemo((): iSingleFilterInstance => ({ getFilterData }), [getFilterData]);

    useImperativeHandle(ref, () => ins);

    return (
      <Form component={false} form={form}>
        <FilterEditor
          value={filterOption ?? props.filterOptionList[0]}
          onChange={setFilterOption}
          formData={formData}
          form={form}
          handleConfirm={props.onSearch}
          prepend={
            <Select
              style={{ minWidth: '100px' }}
              value={filterOption?.field}
              onChange={(value) => {
                /*清理字段值*/
                form.setFieldsValue({
                  [value]: null,
                  [filterOption?.field ?? '']: null
                });
                setFilterOption(props.filterOptionList.find(i => i.field === value));
              }}
            >
              {props.filterOptionList.map(i => (
                <Select.Option key={i.field} value={i.field}>{i.label}</Select.Option>
              ))}
            </Select>
          }
          append={<Button type="primary" onClick={props.onSearch}><SearchOutlined/><span>查询</span></Button>}
        />
        {/*{JSON.stringify(formData)}*/}
      </Form>
    );
  }
);

export interface iSingleFilterProps {
  filterOptionList: iFilterOption[],
  onSearch?: () => void,
}

export interface iSingleFilterInstance {
  getFilterData: () => Promise<{
    queryParam: iFilterHandlerQueryParam | null | undefined,
    formData: PlainObject,
    filterOption: iFilterOption | null | undefined,
    filterTip: iFilterTip | null | undefined
  }>;
}
