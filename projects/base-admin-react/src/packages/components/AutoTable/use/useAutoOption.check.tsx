import {PlainObject} from "@peryl/utils/event";
import {useCallback, useMemo, useState} from "react";
import {getRowsMapper, iAutoOption} from "../auto-table.utils";
import {Checkbox} from "antd";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {createAutoTableColumn} from "../columns/createAutoTableColumn";
import {iAutoColumnCheck} from "../columns/auto-table.columns";

export function useAutoOptionCheck({ state, config, hooks }: iAutoOption) {

  const { stateData, staticColumnList } = state;

  /*多选选中行数据*/
  const [stateCheckedRows, setStateCheckedRows] = useState([] as PlainObject[]);

  /*根据id判断行数据是否已经选中*/
  const checkIdMap = useMemo(() => getRowsMapper(stateCheckedRows), [stateCheckedRows]);

  /*根据id判断行数据是否已经选中*/
  const isChecked = useCallback((row: PlainObject) => !!checkIdMap[row.id], [checkIdMap]);

  /*
  * checkStatus 计算当前页的选中状态
  * check: 当前页所有数据已经被选中
  * uncheck：当前页所有数据没有被选中
  * half：当前页部分数据被选中
  */

  /*方案一：按照当前页数据来计算选中状态，其他页选中数据不参与计算*/
  const checkStatus = useMemo((): 'check' | 'uncheck' | 'half' => {
    if (!stateData.length) {
      return 'uncheck';
    }
    let hasChecked = null as null | boolean;
    let hasUnChecked = null as null | boolean;
    for (const item of stateData) {
      if (isChecked(item)) {
        hasChecked = true;
      } else {
        hasUnChecked = true;
      }
    }
    if (hasChecked && hasUnChecked == null) {
      return 'check';
    }
    if (hasChecked == null && hasUnChecked) {
      return 'uncheck';
    }
    return 'half';
  }, [stateData, isChecked]);

  /*方案二：按照所有页选中数据来计算选中状态，只要出现跨页选中数据就显示为半选状态，只有选中当前页数据并且全部选中才会显示为全选状态*/
  // const checkStatus = useMemo((): 'check' | 'uncheck' | 'half' => {
  //   if (!stateCheckedRows.length) {
  //     return 'uncheck';
  //   }
  //   if (stateCheckedRows.length === stateData.length && stateData.every(i => isChecked(i))) {
  //     return 'check';
  //   }
  //   return 'half';
  // }, [stateData, isChecked, stateCheckedRows]);

  /*全选/取消全选*/
  const toggleCheckAll = useCallback(() => {
    if (checkStatus !== 'check') {
      /*全选当前页数据*/
      const uncheckRows = stateData.filter(i => !isChecked(i));
      setStateCheckedRows(prevRows => [...prevRows, ...uncheckRows]);
    } else {
      /*取消选中当前页数据*/
      const id2stateRow = getRowsMapper(stateData);
      const leftCheckRows = stateCheckedRows.filter(i => !id2stateRow[i.id]);
      setStateCheckedRows(leftCheckRows);
    }
  }, [stateData, isChecked, checkStatus, stateCheckedRows]);

  /*选中行/取消选中行*/
  const toggleCheckRow = useCallback((record: PlainObject) => {
    setStateCheckedRows(prevCheckedRows => {
      prevCheckedRows = [...prevCheckedRows];
      const matchRowIndex = prevCheckedRows.findIndex(i => i.id === record.id);
      if (matchRowIndex > -1) {
        prevCheckedRows.splice(matchRowIndex, 1);
      } else {
        prevCheckedRows.push(record);
      }
      return prevCheckedRows;
    });
  }, []);

  /*多选列*/
  const checkColumn = useMemo((): iAutoColumnCheck => createAutoTableColumn({
    type: 'check',
    dataIndex: '#check',
    seq: -998,
    standard: true,
    title: (
      <Checkbox
        {...checkStatus === 'check' ? { checked: true } : checkStatus === 'half' ? { indeterminate: true } : { checked: false }}
        onClick={toggleCheckAll}
      />
    ),
    fixed: 'left',
    width: '48px',
    align: 'center' as const,
    editable: false,
    inlineRender: ({ record }) => (<Checkbox checked={isChecked(record)} onClick={() => toggleCheckRow(record)}/>)
  }), [checkStatus, isChecked, toggleCheckAll, toggleCheckRow]);

  staticColumnList.push(config.selectType === 'multiple' ? checkColumn : null);

  useStrictMounted(() => {
    /*点击行的时候切换选中行状态*/
    config.selectType === "multiple" && hooks.onClickRow.on(({ record }) => {
      toggleCheckRow(record);
    });
  });

  return {
    stateCheckedRows,
    checkStatus,
    toggleCheckAll,
    toggleCheckRow
  };
}

export type iAutoOptionCheck = ReturnType<typeof useAutoOptionCheck>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    check: iAutoOptionCheck;
  }
}
