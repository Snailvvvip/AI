import {defer} from "@peryl/utils/defer";
import {Button, Form, Input, Modal, notification, Select} from "antd";
import {ResumeIcon} from "./ResumeIcon";
import "./getUserPromptData.scss";
import {createColorGenerator} from "../utils/createColorGenerator";

export function getUserPromptData(
  config: {
    title: string,
    description: string,
    userContent: string,
    predefineOptions: string[],
    platformOptions: string[],
  }
): Promise<iUserPromptData> {

  const dfd = defer<iUserPromptData>();

  const Title = () => (
    <div className="ai-user-prompt-modal-title">
      <ResumeIcon icon="ie-stick"/>
      <span>{config.title}</span>
    </div>
  );

  const colorGenerator = createColorGenerator();

  const predefineOptions = config.predefineOptions.map(item => ({ text: item, color: colorGenerator.nextColor() }));

  let formData: iUserPromptData | undefined = undefined;

  const Content = () => {

    const [form] = Form.useForm();
    const _formData = Form.useWatch(undefined, form);
    formData = _formData;

    return (
      <Form form={form} initialValues={
        {
          userContent: config.userContent ?? '',
          platformCode: config.platformOptions[0]
        } satisfies iUserPromptData
      }>
        <div className="ai-user-prompt-modal-desc">{config.description}</div>
        <Form.Item noStyle name="userContent">
          <Input.TextArea style={{ minHeight: 200 }}/>
        </Form.Item>
        <div className="ai-user-prompt-modal-tag-list">
          {predefineOptions.map((item, index) => (
            <div key={index} style={{ color: item.color }} onClick={() => form.setFieldValue('userContent', item.text)}><span>{item.text}</span></div>
          ))}
        </div>
        <div className="ai-user-prompt-modal-foot">
          <Form.Item name="platformCode" noStyle>
            <Select style={{ minWidth: '200px' }}>
              {config.platformOptions.map((item, index) => (
                <Select.Option key={index} value={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" onClick={confirm}>
            <ResumeIcon icon="ie-stick"/>
            <span>AI 生成</span>
          </Button>
        </div>
      </Form>
    );
  };

  let isDone = false;
  const confirm = () => {
    if (!formData?.userContent.trim().length) {
      notification.warning({ message: '请输入对话内容' });
      return;
    }
    if (!formData?.platformCode.trim().length) {
      notification.warning({ message: '请选择模型' });
      return;
    }
    dfd.resolve(formData);
    isDone = true;
    destroy();
  };
  const cancel = () => {
    dfd.reject('cancel');
    isDone = true;
    destroy();
  };
  const afterClose = () => {
    if (!isDone) {cancel();}
  };

  const { destroy } = Modal.info({
    icon: null,
    closable: true,
    className: "ai-user-prompt-modal",
    width: 600,
    title: <Title/>,
    content: <Content/>,
    footer: null,
    afterClose,
  });

  return dfd.promise;
}

export interface iUserPromptData {
  userContent: string,
  platformCode: string,
}
