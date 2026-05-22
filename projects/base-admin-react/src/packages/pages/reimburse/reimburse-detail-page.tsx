import {Alert, Button, Card, Col, Form, Input, InputNumber, message, notification, Row, Space, Steps} from "antd";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useQuery} from "../../uses/useQuery";
import {createReimburseOtherConfig, createReimburseTravelConfig, iReimburseGeneralRecord} from "./reimburse.utils";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {http} from "../../utils/http";
import {showError} from "../../utils/showError";
import './reimburse-detail-page.scss';
import EditOutlined from "@ant-design/icons/EditOutlined";
import LeftOutlined from "@ant-design/icons/LeftOutlined";
import {createProjectConfig} from "../project/project.utils";
import {router} from "../../home/routes";
import {ApproveSelectLabel} from "../../components/SelectLabel/ApproveSelectLabel";
import {iApproveLog, iApproveRecord} from "../approve/approve.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";
import {AutoObject} from "../../components/AutoTable/components/AutoObject";
import {getNewestValue} from "../../uses/getNewestValue";
import {PageSpin} from "../../components/PageSpin";

export default () => {

  const pageParam = useQuery();
  const [loading, setLoading] = useState(true);

  const [reimburseId/*, setReimburseId*/] = useState<string | null>(String(pageParam.id ?? null));
  const [reimburseRecord, setReimburseRecord] = useState<iReimburseGeneralRecord | null>(null);
  const [approveRecord, setApproveRecord] = useState(null as null | iApproveRecord);

  const travelOption = useAutoOption(() => ({
    ...createReimburseTravelConfig(),
    showCreateButton: false,
    showEditButton: false,
    showOperateColumn: false,
    queryParam: { queries: [{ field: "reimburseId", operator: "=", value: reimburseId }] },
    defaultNewRow: { reimburseId },
    createButtonText: "新建差旅费用",
    handleCreate: async () => {
      const newestFormEditing = await getNewestValue(setFormEditing);
      if (newestFormEditing) {
        notification.warning({ message: '请先保存报销单信息' });
        return;
      }
      await travelOption.methods.createRecord();
    },
  }));

  const otherOption = useAutoOption(() => ({
    ...createReimburseOtherConfig(),
    showCreateButton: false,
    showEditButton: false,
    showOperateColumn: false,
    queryParam: { queries: [{ field: "reimburseId", operator: "=", value: reimburseId }] },
    defaultNewRow: { reimburseId },
    createButtonText: "新建其他费用",
    handleCreate: async () => {
      const newestFormEditing = await getNewestValue(setFormEditing);
      if (newestFormEditing) {
        notification.warning({ message: '请先保存报销单信息' });
        return;
      }
      await otherOption.methods.createRecord();
    },
  }));

  useStrictMounted(() => {
    travelOption.hooks.onAfterInsert.on(() => reload());
    travelOption.hooks.onAfterUpdate.on(() => reload());
    travelOption.hooks.onAfterDelete.on(() => reload());

    otherOption.hooks.onAfterInsert.on(() => reload());
    otherOption.hooks.onAfterUpdate.on(() => reload());
    otherOption.hooks.onAfterDelete.on(() => reload());
  });

  const approve_status = reimburseRecord?.approveStatus ?? 'unsubmit';
  /*未提交、已取消、已驳回的报销单才能够编辑以及重新审批*/
  const isStatusEditable = ['unsubmit', 'cancelled', 'rejected'].indexOf(approve_status) > -1;

  /*isStatusEditable变化的时候，设置 travel, other的table是否显示操作列*/
  useEffect(() => {
    const enableConfig = { showCreateButton: true, showEditButton: true, showOperateColumn: true, };
    const disableConfig = { showCreateButton: false, showEditButton: false, showOperateColumn: false, };
    getNewestValue(travelOption.setConfig).then(travelNewestConfig => {
      if (travelNewestConfig.showOperateColumn !== isStatusEditable) {
        travelOption.setConfig(prevConfig => ({ ...prevConfig, ...isStatusEditable ? enableConfig : disableConfig }));
        otherOption.setConfig(prevConfig => ({ ...prevConfig, ...isStatusEditable ? enableConfig : disableConfig }));
      }
    });
  }, [isStatusEditable, travelOption, otherOption]);

  const [form] = Form.useForm();
  const formData = Form.useWatch(undefined, form);
  let [formEditing, setFormEditing] = useState(isStatusEditable && pageParam.editing === 'Y');
  if (!isStatusEditable) {formEditing = false;}

  const approveLogs = useMemo(() => {
    const approveLogList = JSON.parse(approveRecord?.logs ?? '[]');
    return approveLogList as iApproveLog[];
  }, [approveRecord]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const queryReimburseResponse = await http.post<{ result: iReimburseGeneralRecord }>('/general/reimburse/item', { id: reimburseId });
      console.log(queryReimburseResponse.data.result);
      setReimburseRecord(queryReimburseResponse.data.result);
      form.setFieldsValue(queryReimburseResponse.data.result);

      const approveId = queryReimburseResponse.data.result?.approveId;
      if (!approveId) {
        setApproveRecord(null);
      } else {
        const queryApproveResponse = await http.post<{ result: iApproveRecord }>('/general/approve/item', { id: queryReimburseResponse.data.result?.approveId });
        setApproveRecord(queryApproveResponse.data.result ?? null);
      }
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  }, [reimburseId, form]);

  const saveFormData = async () => {
    const updateReimburseRecord = {
      id: reimburseId,
      ...formData,
    };
    setLoading(true);
    try {
      const resp = await http.post<{ result: any }>('/general/reimburse/update', { row: updateReimburseRecord });
      setReimburseRecord(resp.data.result);
      form.setFieldsValue(resp.data.result);
      setFormEditing(false);
      message.success("保存成功！");
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const cancelFormData = async () => {
    form.setFieldsValue(reimburseRecord);
    setFormEditing(false);
  };

  const [isRunningSubmitReimburse, setIsRunningSubmitReimburse] = useState(false);
  const submitReimburse = useCallback(async () => {
    try {
      setIsRunningSubmitReimburse(true);
      const resp = await http.post<{ message: string }>("/submit_reimburse", { id: reimburseId });
      notification.info({ message: resp.data.message });
      await reload();
    } catch (e) {
      showError(e);
    } finally {
      setIsRunningSubmitReimburse(false);
    }
  }, [reimburseId, reload]);

  const submitReimburseButton = useMemo(() => (
    <Button type="primary" onClick={submitReimburse} loading={isRunningSubmitReimburse}>
      <EditOutlined/>
      <span>提交报销单</span>
    </Button>
  ), [submitReimburse, isRunningSubmitReimburse]);

  useStrictMounted(async () => {await reload();});

  if (!reimburseId) {
    return <Alert type="error" message="缺少页面参数ID"/>;
  }

  return (
    <div style={{ padding: '1em', position: 'relative' }} className="reimburse-detail-page">
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, padding: '1em', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PageSpin/>
        </div>
      )}
      <Card
        style={{ marginBottom: '1em' }}
        title={
          <div>
            <span>报销单信息</span>
            <span style={{ fontWeight: 600 }}>
              <ApproveSelectLabel
                value={reimburseRecord?.approveStatus}
                formatter={(label) => !label?.length ? '' : `（${label}）`}
              />
            </span>
          </div>
        }
        extra={!!reimburseRecord && <Space>
          {!formEditing ?
            <>
              <Button onClick={() => router.navigate(-1)}>
                <LeftOutlined/>
                <span>返回</span>
              </Button>
              {approve_status === 'approving' && (
                <Button type="primary" onClick={() => notification.warning({ message: '待完成...' })}>撤销报销单</Button>
              )}
              {isStatusEditable && <>
                <Button onClick={() => setFormEditing(true)}>
                  <EditOutlined/>
                  <span>编辑</span>
                </Button>
                {submitReimburseButton}
              </>}
            </> :
            <>
              <Button onClick={cancelFormData}>
                <EditOutlined/>
                <span>取消</span>
              </Button>
              <Button type="primary" onClick={saveFormData}>
                <EditOutlined/>
                <span>保存</span>
              </Button>
            </>
          }
        </Space>}
      >
        <Form
          form={form}
          className="reimburse-detail-form"
          disabled={!formEditing}
        >
          <Row>
            <Col span={8}>
              <Form.Item label="报销单标题" name="title">
                <Input/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="proj_id" noStyle hidden/>
              <Form.Item label="所属项目" name="project" preserve>
                <div>
                  <AutoObject
                    config={createProjectConfig}
                    form={form}
                    field="projName"
                    map={{ projId: 'id', projName: 'name' }}
                  />
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="报销金额" name="amount">
                <InputNumber disabled/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="报销备注信息" name="remarks">
            <Input.TextArea/>
          </Form.Item>
        </Form>
      </Card>
      <Card style={{ marginBottom: '1em' }} title="差旅费用信息">
        <AutoTable option={travelOption}/>
      </Card>
      <Card style={{ marginBottom: '1em' }} title="其他费用信息">
        <AutoTable option={otherOption}/>
      </Card>
      <Card style={{ marginBottom: '1em' }} title="审批日志">
        <Steps
          direction="vertical"
          size="small"
          current={1}
          items={approveLogs.reverse().map(item => ({
            title: item.datetime,
            status: 'process',
            description: item.content,
          }))}
        />
      </Card>
    </div>
  );
}
