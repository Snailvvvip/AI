import {createKnowledgeOnlineDocConfig} from "./knowledge.utils";
import {Button, Card, Tooltip} from "antd";
import {router} from "../../home/routes";
import {showError} from "../../utils/showError";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {useAutoFormDrawer} from "../../components/AutoTable/useAutoFormDrawer";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";

export default () => {

  const { editRecordWithDrawer } = useAutoFormDrawer();

  const createDocument = async () => {
    try {
      await editRecordWithDrawer({
        record: {},
        columns: [
          AtcolInput({ title: "文档编码", dataIndex: "code", required: true, })
        ],
        save: async (newRecord) => {
          const doc_code = newRecord.code;
          await router.navigate(`/pages/knowledge/document-edit?id=create&code=${doc_code}`);
        },
      });
    } catch (e) {
      showError(e);
    }
  };

  const option = useAutoOption(() => ({
    ...createKnowledgeOnlineDocConfig(),
    showCreateButton: false,
    buttons: [
      {
        label: '新建文档',
        onClick: createDocument,
        render: () => (
          <Button type="primary" onClick={createDocument}>
            <PlusOutlined/>
            <span>新建文档</span>
          </Button>
        )
      },
      {
        label: '召回测试',
        onClick: createDocument,
        render: () => (
          <Tooltip title="对知识库「在线文档」进行召回测试">
            <Button onClick={() => router.navigate(`/pages/knowledge/knowledge-recall?kb_code=online_document`)}>
              <span>召回测试</span>
            </Button>
          </Tooltip>
        )
      }
    ],
    queryParam: {
      queries: [{ field: 'parentCode', value: 'online_document', operator: '=' }]
    }
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
    </div>
  );
}
