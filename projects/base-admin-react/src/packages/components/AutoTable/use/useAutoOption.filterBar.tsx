import {iAutoOption} from "../auto-table.utils";
import {useMemo, useRef} from "react";
import {iSingleFilterInstance, SingleFilter} from "../../Filter/SingleFilter";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {mergeQueryParam} from "../../Filter/filter.query";
import {iFilterTip} from "../../Filter/filter.utils";

export function useAutoOptionFilterBar(option: iAutoOption) {

  const { state: { filterOptionList }, methods: { reload }, hooks, tips: { setTipList } } = option;

  const singleFilterRef = useRef<iSingleFilterInstance | null>(null);

  const filterBarContent = useMemo(() => (
    <SingleFilter
      ref={singleFilterRef}
      filterOptionList={filterOptionList}
      onSearch={async () => {await reload();}}
    />
  ), [filterOptionList, reload]);

  /*保留每次的filterTip，下一次查询的时候先移除上一次的filterTip*/
  const prevFilterTip = useRef(null as null | undefined | iFilterTip);

  useStrictMounted(async () => {
    hooks.onQueryParam.on(async ({ queryParam }) => {
      const { queryParam: newQueryParam, filterTip } = (await singleFilterRef.current?.getFilterData()) ?? {};
      setTipList(prevList => {
        if (!!prevFilterTip.current) {
          prevList = prevList.filter(i => i !== prevFilterTip.current);
        }
        prevFilterTip.current = filterTip;
        return !filterTip ? prevList : [...prevList, filterTip];
      });
      return { queryParam: !newQueryParam ? queryParam : mergeQueryParam(queryParam, newQueryParam) };
    });
  });

  return {
    singleFilterRef,
    filterBarContent,
  };
}

export type iAutoOptionFilterBar = ReturnType<typeof useAutoOptionFilterBar>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    filterBar: iAutoOptionFilterBar;
  }
}
