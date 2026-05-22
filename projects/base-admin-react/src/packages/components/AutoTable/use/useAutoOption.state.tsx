import {useCallback, useMemo, useState} from "react";
import {iAutoOptionConfig, iAutoOptionRenderConfig, iAutoOptionSortData, iAutoTableRowInjectContextValue, iAutoTempColumnConfig} from "../auto-table.utils";
import {PlainObject} from "@peryl/utils/event";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {getNewestValue} from "../../../uses/getNewestValue";
import {iFilterOption} from "../../Filter/filter.utils";
import {iAutoColumnType} from "../columns/auto-table.columns";

export function useAutoOptionState({ config }: { config: iAutoOptionConfig }) {

  /*动态的用于控制AutoTable字段信息*/
  const staticColumnList: (iAutoColumnType | null)[] = [...config.columns];

  /*动态的用于控制AutoTable渲染内容的变量，比如点击表单查询按钮的时候，显示/隐藏查询表单*/
  const staticRenderList: (iAutoOptionRenderConfig | null)[] = [];

  /*分页参数*/
  const [statePagination, setStatePagination] = useState(() => ({
    current: 1,/*当前页，从1开始，实际请求从0开始*/
    total: 0,/*当前查询条件数据总数*/
    pageSize: config.pageSize ?? 10,/*页大小*/
  }));

  /*排序参数*/
  const [stateSortData, setStateSortData] = useState((): iAutoOptionSortData[] => [{ field: config.sortField ?? 'createdAt', desc: config.sortDesc ?? true }]);

  /*加载状态标识*/
  const [stateLoading, setStateLoading] = useState(config.loadOnStart);

  /*列表数据*/
  const [stateData, setStateData] = useState(() => [] as PlainObject[]);

  /*更新的行数据id标记*/
  const [_stateEditIdMapper, setStateEditIdMapper] = useState({} as Record<string, true | undefined>);

  /*新建的行数据id标记*/
  const [stateCreateIdMapper, setStateCreateIdMapper] = useState({} as Record<string, true | undefined>);

  /*所有正在编辑的行数据id标记*/
  const stateEditIdMapper = useMemo(() => ({ ..._stateEditIdMapper, ...stateCreateIdMapper }), [_stateEditIdMapper, stateCreateIdMapper]);

  /*当前表格是否处于编辑状态*/
  const isEditing = useMemo(() => !!Object.keys(stateEditIdMapper).length, [stateEditIdMapper]);

  /*用来通过record找到FormInstance的一个管理器*/
  const [formInstanceManager] = useState(() => new WeakMap<PlainObject, FormInstance>());

  /*AutoTableRow从AutoOption注入得到的内容*/
  const autoTableRowContextValue = useMemo((): iAutoTableRowInjectContextValue => ({ stateEditIdMapper, formInstanceManager }), [stateEditIdMapper, formInstanceManager]);

  /*获取行数据索引*/
  const getIndex = useCallback(async (record: PlainObject) => {
    const newestStateData = await getNewestValue(setStateData);
    return newestStateData.indexOf(record);
  }, []);

  /*获取显示行号*/
  const getShowIndex = useCallback(async (record: PlainObject) => {
    const index = await getIndex(record);
    if (index === -1) {return index;}
    return (statePagination.current - 1) * statePagination.pageSize + index + 1;
  }, [getIndex, statePagination]);

  /*所有的字段筛选配置信息*/
  const filterOptionList = useMemo(() => config.columns.map(i => !i.dataIndex ? null : i.filterOption).filter(Boolean) as iFilterOption[], [config]);

  /*临时的字段信息更改参数*/
  const [tempColumns, setTempColumns] = useState([] as iAutoTempColumnConfig[]);

  return {
    staticColumnList,
    staticRenderList,
    statePagination,
    setStatePagination,

    stateSortData,
    setStateSortData,

    stateLoading,
    setStateLoading,

    stateData,
    setStateData,

    _stateEditIdMapper,
    setStateEditIdMapper,

    stateCreateIdMapper,
    setStateCreateIdMapper,

    tempColumns,
    setTempColumns,

    stateEditIdMapper,
    isEditing,
    formInstanceManager,
    autoTableRowContextValue,
    getIndex,
    getShowIndex,
    filterOptionList,
  };
}

export type iAutoOptionState = ReturnType<typeof useAutoOptionState>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    state: iAutoOptionState;
  }
}
