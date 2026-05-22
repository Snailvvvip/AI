import {createKnowledgeBaseConfig, createKnowledgeDocConfig} from "./knowledge.utils";
import {Button, Card, notification, Space} from "antd";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import ReloadOutlined from "@ant-design/icons/ReloadOutlined";
import $file from "../../utils/file";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {TokenService} from "../../utils/TokenService";
import {useLoadingState} from "../../uses/useLoadingState";
import {showError} from "../../utils/showError";
import {router} from "../../home/routes";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const knowledgeBaseOption = useAutoOption(() => ({
    ...createKnowledgeBaseConfig(),
    pageSize: 5,
    operations: (record) => {
      return (
        <Button type="link" style={{ padding: 0 }} onClick={() => router.navigate(`/pages/knowledge/knowledge-recall?kb_code=${record.code}`)}>
          召回测试
        </Button>
      );
    }
  }));

  const selectKnowledgeBaseRecord = knowledgeBaseOption.select.stateSelectedRow;

  const knowledgeDocOption = useAutoOption(() => ({
    ...createKnowledgeDocConfig(),
    pageSize: 5,
    showCreateButton: false,
    showEditButton: false,
    parentOption: knowledgeBaseOption,
    parentKeyMap: { parentCode: 'code' },
  }));

  const { loading, isLoading } = useLoadingState();

  async function uploadFiles() {
    const closeLoading = loading();
    try {
      if (!selectKnowledgeBaseRecord?.code) {
        notification.error({ message: "当前知识库缺少知识库编码，请检查！" });
        return;
      }
      const files = await $file.chooseFile({ multiple: true });
      const uploadResponse = await new Promise(async (resolve, reject) => {
        $file.upload({
          file: files,
          action: pathJoin(env.baseURL, '/knowledge/upload_files'),
          filename: 'files',
          data: {
            kb_code: selectKnowledgeBaseRecord!.code
          },
          headers: {
            Authorization: `Bearer ${await TokenService.getToken()}`
          },
          onSuccess: (responseData: any) => {resolve(responseData);},
          onError: (e) => {reject(e);},
        });
      });
      console.log("uploadResponse", uploadResponse);
      notification.info({ message: (uploadResponse as any).message });
      await reloadDocTable();
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  }

  const reloadDocTable = () => knowledgeDocOption.methods.reload();

  return (
    <div style={{ padding: '1em' }}>
      <Card style={{ marginBottom: '1em' }}>
        <AutoTable option={knowledgeBaseOption}/>
      </Card>
      <Card title={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={reloadDocTable}>
              <ReloadOutlined/>
              <span>刷新</span>
            </Button>
            <Button type="primary" onClick={uploadFiles} loading={isLoading}>
              <UploadOutlined/>
              <span>上传文档</span>
            </Button>
          </Space>
        </div>
      }>
        <AutoTable option={knowledgeDocOption}/>
      </Card>
    </div>
  );
}
