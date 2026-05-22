import {Alert, Button, Card, Form, Space, Spin} from "antd";
import {createProjectConfig} from "../../pages/project/project.utils";
import {createHotelConfig} from "../../pages/book/hotel.utils";
import {useContext} from "react";
import {UserInfoContext} from "../../pages/user/user.utils";
import {http} from "../../utils/http";
import {useLoadingState} from "../../uses/useLoadingState";
import {showError} from "../../utils/showError";
import {AutoObject} from "../AutoTable/components/AutoObject";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {iChatGraphState} from "./chatbot.utils";

/*渲染中断表单*/
export function ChatInterruptForm(props: iChatInterruptFormProps) {

  const user_info = useContext(UserInfoContext)!;

  const [form] = Form.useForm();

  const { loading, isLoading } = useLoadingState();

  const columnsGetter = ChatInterruptFormColumns[props.formCode];

  if (!columnsGetter) {
    return <Alert message={`无法识别formCode:${props.formCode}`}/>;
  }

  const handleCancel = async () => {
    const closeLoading = loading();
    try {
      const resp = await http.post<iChatGraphState>(`/langgraph/chat_resume/${props.conversationId}`, { resume_data: 'N' });
      await props.handleChange(resp.data);
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  };

  const handleConfirm = async () => {
    const formData = await form.validateFields();
    formData.user_id = user_info.id;
    formData.user_name = user_info.full_name;

    const closeLoading = loading();
    try {
      const resp = await http.post<iChatGraphState>(`/langgraph/chat_resume/${props.conversationId}`, { resume_data: formData });
      await props.handleChange(resp.data);
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  };

  return (
    <Card title={props.title} style={{ position: 'relative' }}>
      <Form form={form}>
        {columnsGetter({ form })}
      </Form>
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>确定</Button>
        </Space>
      </div>
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin/>
        </div>
      )}
    </Card>
  );
}

const ChatInterruptFormColumns: Record<string, undefined | ((param: { form: FormInstance }) => any)> = {
  bookHotel: ({ form }) => <>
    <Form.Item label="所属项目" name="project_name" rules={[{ required: true, message: "所属项目必填" }]}>
      <AutoObject
        config={createProjectConfig}
        form={form}
        field="project_name"
        map={{ proj_id: 'id', project_name: 'name' }}
      />
    </Form.Item>
    <Form.Item label="酒店名称" name="hotel_name" rules={[{ required: true, message: "酒店必填" }]}>
      <AutoObject
        config={createHotelConfig}
        form={form}
        field="hotel_name"
        map={{ hotel_id: 'id', hotel_name: 'title' }}
      />
    </Form.Item>
  </>,
};

export interface iChatInterruptFormProps {
  title: string,
  formCode: string,
  conversationId: string,
  handleChange: (graphState: iChatGraphState) => Promise<void>
}
