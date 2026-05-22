import React, {useCallback, useMemo} from "react";
import {AutoTableRowInjectContext, iAutoOption} from "../auto-table.utils";
import {Table} from "antd";
import {AutoTableRow, iAutoTableRowProps} from "../components/AutoTableRow";
import {findParentElement} from "@peryl/utils/findParentElement";

export function useAutoOptionTable({ methods, columns, state, hooks }: iAutoOption) {

  const { stateData, stateLoading, statePagination, autoTableRowContextValue, isEditing, staticRenderList } = state;

  const { load } = methods;

  /*处理antd Table的change事件*/
  const handleTableChange = useCallback(async (page: number, pageSize: number) => {
    await load(page, pageSize);
  }, [load]);

  const tableRender = useMemo(() => (
    <AutoTableRowInjectContext.Provider value={autoTableRowContextValue}>
      <Table
        rowKey="id"
        columns={columns.allColumns}
        dataSource={stateData}
        loading={stateLoading}
        components={{
          body: {
            // cell: EditableCell,
            row: AutoTableRow,
          },
        }}
        pagination={{
          current: statePagination.current,
          /*这里得去较大值，否则会导致新建数据时由于无法滚动导致底部的数据看不见*/
          pageSize: isEditing ? Math.max(statePagination.pageSize, stateData.length) : statePagination.pageSize,
          total: statePagination.total,
          onChange: handleTableChange
        }}
        scroll={{ x: 'max-content', y: 'max-content' }}
        onRow={(record, index): iAutoTableRowProps => ({
          record,
          index,
          onClick: (e: React.MouseEvent<HTMLTableRowElement>) => {
            const editElement = findParentElement(e.target as any, (el) => el.tagName === 'BUTTON' || el.tagName === 'INPUT', true);
            if (!editElement) {
              hooks.onClickRow.exec({ record, index, e });
            }
          },
          onDoubleClick: (e: React.MouseEvent<HTMLTableRowElement>) => {
            const editElement = findParentElement(e.target as any, (el) => el.tagName === 'BUTTON' || el.tagName === 'INPUT', true);
            if (!editElement) {
              hooks.onDblClickRow.exec({ record, index, e });
            }
          }
        })}
      />
    </AutoTableRowInjectContext.Provider>
  ), [columns, stateData, stateLoading, statePagination, handleTableChange, hooks, autoTableRowContextValue, isEditing]);

  const tableRenderConfig = useMemo(() => ({ key: 'table', seq: 2, render: tableRender }), [tableRender]);

  staticRenderList.push(tableRenderConfig);

  return {
    tableRenderConfig,
  };
}

export type iAutoOptionTable = ReturnType<typeof useAutoOptionTable>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    table: iAutoOptionTable;
  }
}
