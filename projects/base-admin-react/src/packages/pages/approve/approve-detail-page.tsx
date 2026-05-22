import {Alert, Card, Steps} from "antd";
import {useQuery} from "../../uses/useQuery";
import {http} from "../../utils/http";
import {iApproveLog, iApproveProjRecord} from "./approve.utils";
import {useMemo, useState} from "react";
import {useLoadingState} from "../../uses/useLoadingState";
import {showError} from "../../utils/showError";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {ApproveSelectLabel} from "../../components/SelectLabel/ApproveSelectLabel";
import {PageSpin} from "../../components/PageSpin";

export default () => {

  const pageParam = useQuery();
  const approveId = pageParam.id;

  if (!approveId) {return <Alert type="error" message="缺少页面参数：id"/>;}

  const [approveRecord, setApproveRecord] = useState(null as null | iApproveProjRecord);

  const approveLogs = useMemo(() => {
    const approveLogList = JSON.parse(approveRecord?.logs ?? '[]');
    return approveLogList as iApproveLog[];
  }, [approveRecord]);

  const { loading, isLoading } = useLoadingState();

  const reload = async () => {
    const closeLoading = loading();
    try {
      const resp = await http.post<{ result: iApproveProjRecord }>('/approve/item', { id: approveId });
      setApproveRecord(resp.data.result);
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  };

  useStrictMounted(async () => {await reload();});

  return (
    <div style={{ padding: '1em', position: "relative" }}>
      {isLoading && (
        <div style={{ position: 'absolute', inset: "0", display: "flex", justifyContent: "center", alignItems: "center", minHeight: '200px' }}>
          <PageSpin/>
        </div>
      )}
      {!!approveRecord && (
        <>
          <Card title={approveRecord.title}>
            <ul style={{ padding: "0 1em", margin: 0 }}>
              <li>状态：<ApproveSelectLabel value={approveRecord.status}/></li>
              <li>项目：{approveRecord.project?.name}</li>
              <li>内容：{approveRecord.description}</li>
              <li>金额：{approveRecord.amount}</li>
            </ul>
          </Card>
          <Card style={{ marginTop: '1em' }} title="审批日志">
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
        </>
      )}
    </div>
  );
}
