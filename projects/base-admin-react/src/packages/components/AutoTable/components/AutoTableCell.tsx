import {AutoTableRowProvideContext} from "../auto-table.utils";

import {useContext} from "react";
import {PlainObject} from "@peryl/utils/event";
import {iAutoColumnEditParam, iAutoColumnType, useCellEdit} from "../columns/auto-table.columns";
import {Form, Tooltip} from "antd";

export function AutoTableCell(
  props: {
    column: iAutoColumnType,
    value: any,
    record: PlainObject,
    index: number,
    dataIndex: string,
  }
) {

  if (!props.column) {
    return null;
  }

  const { editable, form, formData } = useContext(AutoTableRowProvideContext);

  const { isEditable, rules } = useCellEdit({
    column: props.column,
    record: props.record,
    index: props.index,
    rowEditable: editable,
  });

  if (isEditable) {
    const editParam: iAutoColumnEditParam = {
      record: props.record,
      index: props.index,
      formData,
      form,
      dataIndex: props.dataIndex,
      rules
    };
    return (
      <Form.Item
        name={props.dataIndex}
        noStyle
        rules={rules}
        {...!props.column.getFormItemProps ? {} : props.column.getFormItemProps({ ...editParam, drawer: false })}
      >
        {props.column.inlineEditor?.(editParam)}
      </Form.Item>
    );
  }

  const renderContent: any = props.column.inlineRender?.({
    value: props.value,
    record: props.record,
    index: props.index,
    dataIndex: props.dataIndex
  });

  if (props.column.maxShowLen != null) {
    if (typeof renderContent === "string" || typeof renderContent === "number") {
      const text = String(renderContent).trim();
      const length = text.length;
      if (length > props.column.maxShowLen) {
        return <Tooltip title={renderContent} placement="topLeft"><span>{text.slice(0, props.column.maxShowLen) + '......'}</span></Tooltip>;
      }
    }
  }

  return renderContent;
}
