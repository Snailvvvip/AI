import {useMemo} from "react";
import {iAutoOption} from "../auto-table.utils";
import {deepcopy} from "@peryl/utils/deepcopy";
import {insertSort} from "@peryl/utils/insertSort";
import {iAutoColumnIndex, iAutoColumnType} from "../columns/auto-table.columns";
import {createAutoTableColumn} from "../columns/createAutoTableColumn";

export function useAutoOptionColumns({ state, select, config, check, operate }: iAutoOption) {

  const { statePagination, tempColumns, staticColumnList } = state;
  const { stateSelectedRow } = select;

  /*索引列*/
  const indexColumn = useMemo((): iAutoColumnIndex => createAutoTableColumn({
    type: 'index',
    dataIndex: '#index',
    title: '#',
    seq: -999,
    standard: true,
    width: '48px',
    fixed: 'left',
    align: 'center',
    editable: false,
    inlineRender: ({ record, index }) => {
      const value = ((statePagination.current - 1) * statePagination.pageSize) + (index + 1);
      const isSelected = record.id === stateSelectedRow?.id;
      return (
        <div style={{
          height: '20px',
          width: '20px',
          lineHeight: '20px',
          textAlign: 'center',
          backgroundColor: isSelected ? '#1677ff' : '',
          color: isSelected ? 'white' : '',
          transition: 'all ease 300ms',
          borderRadius: '2px'
        }}
        >
          {value}
        </div>
      );
    }
  }), [statePagination, stateSelectedRow]);

  staticColumnList.push(indexColumn);

  /*所有列*/
  const totalColumns = useMemo(() => {

    let _columns = [...staticColumnList.filter(Boolean)] as iAutoColumnType[];

    let columnIndex = 0;
    _columns = _columns.map(col => ({ ...col, seq: col.seq ?? ++columnIndex, }));

    /*标准列组件*/
    const standardColumns = _columns.filter(i => !!i.standard);
    /*非标准列组件*/
    const sourceOtherColumns = _columns.filter(i => !i.standard);

    /*如果tempColumns列信息存在，使用这个列信息来调整otherColumns列信息*/
    const targetOtherColumns = !tempColumns.length ? [...sourceOtherColumns] : (() => {
      const replaceColumnList = sourceOtherColumns.map(i => {
        const tempItem = tempColumns.find(tempItem => tempItem.field === i.dataIndex);
        if (!tempItem) {return i;}
        return {
          ...i,
          width: tempItem.width,
          minWidth: tempItem.minWidth,
          seq: tempItem.seq,
          fixed: tempItem.fixed as any,
        };
      });
      insertSort(replaceColumnList as any[], (a, b) => (a.seq ?? sourceOtherColumns.indexOf(a)) > (b.seq ?? sourceOtherColumns.indexOf(b)));
      return replaceColumnList;
    })();

    /*找到没有设置宽度的列，没有设置宽度的列就是占满剩余宽度的列*/
    const fitWidthColumn = targetOtherColumns.find(i => i.width == null);
    if (!fitWidthColumn && !!targetOtherColumns.length) {
      const lastColumn = deepcopy(targetOtherColumns.pop()!);
      lastColumn.width = undefined;
      lastColumn.minWidth = 100;
      targetOtherColumns.push(lastColumn);
    }

    const allColumns = [...standardColumns, ...targetOtherColumns];

    insertSort(allColumns, (a, b) => {
      const aSeq = a.seq! + (a.fixed === 'lenft' ? -999 : a.fixed === 'right' ? 999 : 0);
      const bSeq = b.seq! + (b.fixed === 'lenft' ? -999 : b.fixed === 'right' ? 999 : 0);
      return aSeq > bSeq;
    });

    return { standardColumns, sourceOtherColumns, targetOtherColumns, allColumns };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, indexColumn, ...staticColumnList, tempColumns]);

  return totalColumns;
}

export type iAutoOptionColumns = ReturnType<typeof useAutoOptionColumns>

declare module '../auto-table.utils' {
  export interface iAutoOption {
    columns: iAutoOptionColumns;
  }
}
