import {Button, Form, Input, Modal, notification, Space} from "antd";
import {createApproveConfig, iApproveProjRecord} from "./approve.utils";
import {useContext} from "react";
import {UserInfoContext} from "../user/user.utils";
import {http} from "../../utils/http";
import {showError} from "../../utils/showError";
import {defer} from "@peryl/utils/defer";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export const ApproveList = () => {
  const userInfo = useContext(UserInfoContext)!;

  const option = useAutoOption(() => ({
    ...createApproveConfig(),
    showCreateButton: false,
    showEditButton: false,
    showDeleteButton: false,
    operations: (record) => record.status === 'approving' ? (
      <>
        <Button variant="link" color="primary" style={{ padding: 0 }} onClick={() => acceptApprove(record as iApproveProjRecord)}>审批通过</Button>
        <Button variant="link" color="danger" style={{ padding: 0 }} onClick={() => rejectApprove(record as iApproveProjRecord)}>审批拒绝</Button>
      </>
    ) : null,
    queryParam: {
      queries: [{ field: 'userId', value: userInfo.id, operator: '=' }]
    }
  }));

  const acceptApprove = async (record: iApproveProjRecord) => {
    const { destroy } = Modal.confirm({
      title: '审批通过确认？',
      content: record.title,
      onOk: async () => {
        try {
          await http.post('/process_approve', { flag: true, user_id: userInfo.id, approve_id: record.id, });
          notification.info({ message: '已经通过审批' });
          await option.methods.reload();
        } catch (e) {
          showError(e);
        } finally {
          destroy();
        }
      }
    });
  };

  const rejectApprove = async (record: iApproveProjRecord) => {
    try {
      const reason = await getRejectReason({ defaultInput: record.llm_reason });
      await http.post('/process_approve', { flag: false, user_id: userInfo.id, approve_id: record.id, reason: `「${userInfo.full_name}」已经驳回审批，原因：${reason}` });
      notification.info({ message: '已经驳回审批' });
      await option.methods.reload();
    } catch (e) {
      showError(e);
    }
  };

  return (
    <AutoTable option={option}/>
  );
};

/*打开一个弹框表单，编辑报销单信息，并且将报销单信息异步返回*/
function getRejectReason(
  config?: {
    onCancel?: () => void,
    defaultInput: string | null | undefined
  }
): Promise<string> {

  const dfd = defer<string>();

  let formData: { text: string } = { text: '' };

  const Content = () => {
    const [form] = Form.useForm();
    formData = Form.useWatch(undefined, form);
    return (
      <Form
        form={form}
        initialValues={{ text: config?.defaultInput ?? '报销理由不充分' }}
      >
        <Form.Item noStyle name="text">
          <Input.TextArea style={{ minHeight: '200px' }}/>
        </Form.Item>
      </Form>
    );
  };

  const Footer = () => (
    <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '1em' }}>
      <Button onClick={cancel}>取消</Button>
      <Button type="primary" onClick={confirm}>确定</Button>
    </Space>
  );

  /*判断是否触发过confirm或者cancel函数*/
  let isDone = false;

  const confirm = () => {
    if (!formData.text?.trim().length) {
      notification.warning({ message: '请检查表单信息', description: "驳回原因不能为空" });
      return;
    }
    dfd.resolve(formData.text);
    isDone = true;
    destroy();
  };

  const cancel = () => {
    config?.onCancel?.();
    destroy();
    isDone = true;
  };

  const afterClose = () => {if (!isDone) {cancel();}};

  const { destroy } = Modal.info({
    icon: null,
    title: "请输入驳回原因",
    closable: true,
    width: 600,
    content: <Content/>,
    footer: <Footer/>,
    afterClose: afterClose,
  });


  return dfd.promise;
}

