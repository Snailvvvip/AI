import React, {useMemo} from "react";
import {Button, Popconfirm, Space} from "antd";
import {createAutoTableColumn} from "../columns/createAutoTableColumn";
import {iAutoOption} from "../auto-table.utils";
import {iAutoColumnOperate} from "../columns/auto-table.columns";

export function useAutoOptionOperate({ config, methods, state }: iAutoOption) {

  const { staticColumnList } = state;
  const { deleteRecord, saveRecord, cancelEditRecord, copyRecord, editRecord } = methods;

  const operateColumn = useMemo((): iAutoColumnOperate => {
    return createAutoTableColumn({
      type: 'operate',
      dataIndex: '#operate',
      seq: 999,
      standard: true,
      title: '操作列',
      width: '120px',
      align: 'center' as const,
      sortable: false,
      fixed: 'right',
      inlineRender: ({ record, index }) => (<>
        <Space size="small" className="auto-table-operate-cell">
          {config.operations?.(record, index)}

          {config.showEditButton && <Button variant="link" color="primary" data-no-padding onClick={() => editRecord(record)}>编辑</Button>}
          {config.showEditButton && config.showCopyButton !== false && <Button variant="link" color="primary" data-no-padding onClick={() => copyRecord(record)}>复制</Button>}

          {config.showDeleteButton && (
            <Popconfirm title="确定删除?" onConfirm={() => {deleteRecord(record);}}>
              <Button variant="link" color="danger" data-no-padding>删除</Button>
            </Popconfirm>
          )}
        </Space>
      </>),
      inlineEditor: ({ record }) => <>
        <Space size="small" className="auto-table-operate-cell">
          <Button variant="link" color="primary" data-no-padding onClick={() => saveRecord(record)}>保存</Button>
          <Button variant="link" color="primary" data-no-padding onClick={() => cancelEditRecord(record)}>取消</Button>
        </Space>
      </>
    }, { checkDataIndex: false });
  }, [config, editRecord, deleteRecord, cancelEditRecord, saveRecord, copyRecord]);

  staticColumnList.push(config.showOperateColumn ? operateColumn : null);

  return {};
}

export type iAutoOptionOperate = ReturnType<typeof useAutoOptionOperate>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    operate: iAutoOptionOperate;
  }
}
