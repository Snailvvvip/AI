import {Button, Card} from "antd";
import {useContext} from "react";
import {router} from "../../home/routes";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {showError} from "../../utils/showError";
import {UserInfoContext} from "../user/user.utils";
import dayjs from "dayjs";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const userInfo = useContext(UserInfoContext)!;
  const doc_code = `report_${userInfo.id}`;

  const create_report = async () => {
    try {
      const doc_name = `${dayjs().format('YYYY-MM-DD')}工作日报`;
      await router.navigate(`/pages/knowledge/document-edit?id=create&code=${doc_code}&kb_code=${doc_code}&name=${doc_name}`);
    } catch (e) {
      showError(e);
    }
  };

  const option = useAutoOption(() => ({
    module: 'knowledge_doc',
    columns: [
      AtcolInput({ title: "标题", dataIndex: "name" }),
      AtcolDatetime({ title: "创建时间", dataIndex: "createdAt" }),
    ],
    showCreateButton: false,
    showEditButton: false,
    queryParam: {
      queries: [{ field: 'code', value: doc_code, operator: '=' }]
    },
    operations: (record) => <>
      <Button type="link" onClick={() => router.navigate(`/pages/knowledge/document-edit?id=${record.id}`)}>编辑</Button>
    </>,
    buttons: [
      {
        render: () => (
          <Button onClick={() => router.navigate(`/pages/knowledge/knowledge-recall?kb_code=${doc_code}`)}>
            <span>日报检索</span>
          </Button>
        )
      },
      {
        render: () => (
          <Button type="primary" onClick={create_report}>
            <PlusOutlined/>
            <span>新建日报</span>
          </Button>
        )
      }
    ]
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
    </div>
  );
}
