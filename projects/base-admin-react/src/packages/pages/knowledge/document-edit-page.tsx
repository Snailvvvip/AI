import {DualEditor} from "../../components/DualEditor/DualEditor";
import {Alert, Button, Card, notification, Space} from "antd";
import {useQuery} from "../../uses/useQuery";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {http} from "../../utils/http";
import {iKnowledgeDocRecord} from "./knowledge.utils";
import {useRef, useState} from "react";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import {router} from "../../home/routes";
import LeftOutlined from "@ant-design/icons/LeftOutlined";
import {showError} from "../../utils/showError";
import {useLoadingState} from "../../uses/useLoadingState";
import './document-edit-page.scss';
import {delay} from "@peryl/utils/delay";
import {PageSpin} from "../../components/PageSpin";

export default () => {

  let { id: doc_id, code: doc_code, kb_code, name: doc_name } = useQuery();
  kb_code = kb_code ?? 'online_document';

  const [docRecord, setDocRecord] = useState(null as null | Partial<iKnowledgeDocRecord>);

  const domRef = useRef(null as null | HTMLDivElement);

  const reload = async () => {
    if (doc_id === 'create') {
      if (!doc_code?.trim().length) {
        notification.error({ message: "缺少页面参数DOC_CODE" });
        return;
      }
      setDocRecord({ name: doc_name ?? '新建文档', code: doc_code, parent_code: kb_code });
      return;
    }
    try {
      const resp = await http.post<{ result: iKnowledgeDocRecord }>('/knowledge_doc_with_creator/item', { id: doc_id });
      console.log(resp.data.result);
      setDocRecord(resp.data.result);
      delay(78).then(() => {domRef.current!.querySelector('.document-edit-page-card')!.scrollTop = 0;});
    } catch (e) {
      showError(e);
    }
  };

  // 增加一个初始化的加载动作
  const { loading, isLoading } = useLoadingState();
  const [closeInitLoading] = useState(() => loading());
  useStrictMounted(async () => {
    await reload();
    await delay(100);
    closeInitLoading();
  });

  if (doc_id === 'create' && !(doc_code as string | null)?.trim().length) {
    return <div style={{ padding: '1em' }}>
      <Alert message="缺少页面参数DOC_CODE" type="error" showIcon/>
    </div>;
  }

  const { loading: startSaving, isLoading: isSaving } = useLoadingState();

  const save = async () => {
    const closeSaving = startSaving();
    try {
      const url = !docRecord?.id ? '/knowledge_doc_with_creator/insert' : '/knowledge_doc_with_creator/update';
      const resp = await http.post<{ result: iKnowledgeDocRecord }>(url, docRecord);
      setDocRecord(resp.data.result);
      notification.success({ message: '保存成功' });
      await router.navigate(-1);
    } catch (e) {
      showError(e);
    } finally {
      closeSaving();
    }
  };

  return (
    <div className="document-edit-page" style={{ padding: '1em' }} ref={domRef}>
      <Card
        className="document-edit-page-card"
        title={
          <div style={{ display: 'flex' }}>
            <input
              style={{ fontSize: '2em', fontWeight: 600, flex: 1, padding: '0', outline: 'none', border: 'none' }}
              value={docRecord?.name ?? ''}
              onChange={e => setDocRecord(prev => ({ ...prev, name: e.target.value }))}
            />
            <Space>
              <Button onClick={() => router.navigate(-1)}>
                <LeftOutlined/>
                <span>返回</span>
              </Button>
              <Button type="primary" onClick={save} loading={isSaving}>
                {!isSaving && <SaveOutlined/>}
                <span>保存</span>
              </Button>
            </Space>
          </div>
        }
      >
        {!docRecord ? <PageSpin/> : <>
          <DualEditor
            value={docRecord.content}
            onChange={val => setDocRecord(prev => ({ ...prev, content: val }))}
          />
        </>}
      </Card>
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity ease 300ms',
          zIndex: 3,
        }}>
          <PageSpin/>
        </div>
      )}
    </div>
  );
}
