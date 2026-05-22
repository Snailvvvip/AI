import React, {useContext, useEffect, useMemo, useRef} from "react";
import {Form} from "antd";
import {PlainObject} from "@peryl/utils/event";
import {AutoTableRowInjectContext, AutoTableRowProvideContext, iAutoTableRowProvideContextValue} from "../auto-table.utils";

export function AutoTableRow(props: iAutoTableRowProps) {

  const { record, index, ...leftProps } = props;

  const tableRowContent = (<tr {...leftProps}>{props.children}</tr>);

  /*没有record并且index，说明当前数据为空，渲染空数据行*/
  if (!record || index == null) {return tableRowContent;}

  // console.log(record, index, leftProps);
  const defaultFormDataRef = useRef({} as PlainObject);
  const [form] = Form.useForm();
  const formData = Form.useWatch(null, form) ?? defaultFormDataRef.current;

  const { stateEditIdMapper, formInstanceManager } = useContext(AutoTableRowInjectContext);

  const autoTableRowEditable = !!stateEditIdMapper[record.id];

  const autoTableRowProvideValue = useMemo((): iAutoTableRowProvideContextValue => ({ editable: autoTableRowEditable, form, formData }), [autoTableRowEditable, form, formData]);

  useEffect(() => {
    /*将record与form关联*/
    formInstanceManager.set(record, form);
    return () => {
      /*删除record与form*/
      formInstanceManager.delete(record);
    };
  }, [formInstanceManager, record, form]);

  /*当编辑状态转为非编辑状态时，重置编辑行信息*/
  useEffect(() => {
      if (!autoTableRowEditable) {
        /*这里调用resetFields方法没法应用最新的字段值，改用setFieldsValue*/
        form.setFieldsValue(record);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoTableRowEditable, form]
  );

  return (
    <AutoTableRowProvideContext.Provider value={autoTableRowProvideValue}>
      {autoTableRowEditable ? (
          /*当前行需要编辑*/
          <Form form={form} component={false} initialValues={record}>
            {tableRowContent}
          </Form>
        ) :
        /*当前行不需要编辑*/
        tableRowContent
      }
    </AutoTableRowProvideContext.Provider>
  );
}

export interface iAutoTableRowProps {
  record: PlainObject | undefined,
  index: number | undefined,
  children?: React.ReactNode,
  className?: string,
  ['data-row-key']?: string,
  onClick?: any,
  onDoubleClick?: any,
  style?: any,
}
