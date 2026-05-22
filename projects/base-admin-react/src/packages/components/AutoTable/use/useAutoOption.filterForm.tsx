import {iAutoOption, iAutoOptionRenderConfig} from "../auto-table.utils";
import {useMemo, useRef, useState} from "react";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {mergeQueryParam} from "../../Filter/filter.query";
import {iMultipleFilterInstance, MultipleFilter} from "../../Filter/MultipleFilter";
import {iFilterTip} from "../../Filter/filter.utils";

export function useAutoOptionFilterForm(option: iAutoOption) {

  const { state: { filterOptionList, staticRenderList }, methods: { reload }, hooks, tips: { setTipList } } = option;

  const multipleFilterRef = useRef<iMultipleFilterInstance | null>(null);

  const [showFilterForm, setShowFilterForm] = useState(false);

  const hasInitFilterForm = useRef(false);

  if (showFilterForm && !hasInitFilterForm.current) {hasInitFilterForm.current = true;}

  const filterFormContent = useMemo(() => (
    !hasInitFilterForm.current ? null : <div style={{ display: showFilterForm ? 'block' : 'none' }}>
      <MultipleFilter
        ref={multipleFilterRef}
        filterOptionList={filterOptionList}
        onSearch={async () => {await reload();}}
      />
    </div>
  ), [filterOptionList, reload, showFilterForm]);

  const filterFormRenderConfig = useMemo((): iAutoOptionRenderConfig => {
    return {
      seq: 0,
      key: 'filterForm',
      render: filterFormContent
    };
  }, [filterFormContent]);

  staticRenderList.push(hasInitFilterForm.current ? filterFormRenderConfig : null);

  const prevFilterTipList = useRef<iFilterTip[]>([]);

  useStrictMounted(async () => {
    hooks.onQueryParam.on(async ({ queryParam }) => {
      const { queryParam: newQueryParam, filterTipList } = (await multipleFilterRef.current?.getFilterData()) ?? {};

      setTipList(prevList => {
        if (!!prevFilterTipList.current.length) {
          prevList = prevList.filter(i => !prevFilterTipList.current.includes(i));
        }
        prevFilterTipList.current = filterTipList ?? [];
        return !filterTipList?.length ? prevList : [...prevList, ...filterTipList];
      });

      return { queryParam: !newQueryParam ? queryParam : mergeQueryParam(queryParam, newQueryParam) };
    });
  });

  return {
    multipleFilterRef,
    filterFormContent,
    showFilterForm,
    setShowFilterForm,
  };
}

export type iAutoOptionFilterForm = ReturnType<typeof useAutoOptionFilterForm>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    filterForm: iAutoOptionFilterForm;
  }
}
