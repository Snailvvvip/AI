import {iAutoColumnEditParam, iAutoColumnType, useCellEdit} from './columns/auto-table.columns';
import {useCallback, useMemo} from "react";
import {PlainObject} from "@peryl/utils/event";
import {Form} from "antd";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {delay} from "@peryl/utils/delay";
import {useDrawer} from '../../uses/useDrawer';
import {useCopilotDrawer} from "../../uses/useCopilotDrawer";
import {getErrorMessage, showError} from "../../utils/showError";
import {getChatFormAutoFillPrompt} from "./auto-table.prompts";

export function useAutoFormDrawer() {

  const { openDrawer } = useDrawer();
  const { openChatBox } = useCopilotDrawer();

  const editRecordWithDrawer = useCallback(async (
    { record, save, index, columns, title }: {
      record: PlainObject,
      index?: number,
      columns: iAutoColumnType[],
      save: (editRecord: PlainObject) => void | boolean | Promise<void | boolean>,
      title?: string,
    }
  ) => {

    if (index == null) {index = 0;}

    let formRef = null as null | FormInstance;

    const intelligentFillOutForm = async () => {
      const { closeChatbox } = openChatBox({
        /*系统提示词*/
        mode: { type: 'LangServe', cacheKey: false },
        systemPrompt: getChatFormAutoFillPrompt(columns),
        handleAiMessage: async (message: string) => {
          try {
            const parseData = JSON.parse(message);
            console.log('提取结果', parseData);
            formRef?.setFieldsValue(parseData);
            await delay(500);
            closeChatbox();
          } catch (e) {
            console.error(e);
            showError("解析结果JSON格式不正确：" + getErrorMessage(e));
          }
        },
        fastQuestions: null,
        fastSenders: null,
      });
    };

    openDrawer({
      title,
      drawerWidth: 450,
      content: <DrawerForm record={record} index={index} columns={columns} onRefForm={form => formRef = form}/>,
      handleConfirm: async () => {
        try {
          const values = await formRef!.validateFields();
          const flag = await save(values);
          if (flag === false) {return flag;}
          formRef = null;
        } catch (e) {
          showError(e);
          return false;
        }
      },
      handleCancel: () => {
        formRef = null;
      },
      footerLeft: <div style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} onClick={intelligentFillOutForm}>
        <span>📝&nbsp;</span>
        <span style={{ background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', fontSize: '1em', whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif', display: 'inline-block' }}>
        智能填写表单
        </span>
      </div>
    });

  }, [openDrawer, openChatBox]);

  return { editRecordWithDrawer };
}

export type iAutoFormDrawer = ReturnType<typeof useAutoFormDrawer>

const DrawerForm = (props: { record: PlainObject, index: number, columns: iAutoColumnType[], onRefForm: (form: FormInstance) => void }) => {

  const [form] = Form.useForm();
  const formData = Form.useWatch(null, form) ?? {};

  props.onRefForm(form);

  const labelCol = useMemo(() => ({ style: { width: '120px' } }), []);

  return (
    <div className="auto-table-form-drawer">
      <Form form={form} initialValues={props.record} labelCol={labelCol}>
        {props.columns.map((column, colIndex) => (
          <DrawerFormItem
            key={String(column.dataIndex ?? colIndex)}
            column={column}
            record={props.record}
            index={props.index}
            form={form}
            formData={formData}
          />
        ))}
      </Form>
    </div>
  );
};

const DrawerFormItem = (props: { column: iAutoColumnType, record: PlainObject, index: number, form: FormInstance, formData: PlainObject }) => {
  const dataIndex = String(props.column.dataIndex);
  const { isEditable, rules } = useCellEdit({
    column: props.column,
    record: props.record,
    index: props.index,
    rowEditable: true,
  });
  const editorFunc = props.column.formEditor ?? props.column.inlineEditor;

  if (!isEditable || !editorFunc) {
    return (
      <Form.Item label={String(props.column.originTitle)}>{props.column.inlineRender({
        value: props.record[dataIndex],
        record: props.record,
        index: props.index,
        dataIndex: dataIndex,
      })}
      </Form.Item>
    );
  }

  const editParam: iAutoColumnEditParam = {
    record: props.record,
    index: props.index,
    formData: props.formData,
    form: props.form,
    dataIndex: dataIndex,
    rules: rules,
  };

  return (
    <Form.Item
      label={String(props.column.originTitle)}
      name={dataIndex}
      rules={rules}
      {...!props.column.getFormItemProps ? {} : props.column.getFormItemProps({ ...editParam, drawer: false })}
    >
      {editorFunc(editParam)}
    </Form.Item>
  );
};
