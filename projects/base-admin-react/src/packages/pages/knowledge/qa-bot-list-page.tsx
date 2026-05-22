import {AutoTable} from "../../components/AutoTable/AutoTable";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {AtcolToggle} from "../../components/AutoTable/columns/AtcolToggle";
import {Button, Card, message} from "antd";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import {useStableCallback} from "../../uses/useStableCallback";
import {usePickAutoObject} from "../../components/AutoTable/components/usePickAutoObject";
import {createKnowledgeBaseConfig, iKnowledgeBaseRecord, iKnowledgeRelQaBase} from "./knowledge.utils";
import {getNewestValue} from "../../uses/getNewestValue";
import {showError} from "../../utils/showError";
import {http} from "../../utils/http";
import {pathJoin} from "@peryl/utils/pathJoin";
import {TokenService} from "../../utils/TokenService";

export default () => {

  const option = useAutoOption(() => ({
    module: 'knowledge_qa_bot',
    columns: [
      AtcolInput({
        title: '机器人名称', dataIndex: 'name', required: true, inlineRender: ({ value, record }) => {
          return <Button type="link" onClick={async () => {
            const path = pathJoin(window.location.origin, __webpack_public_path__, `/private/knowledge/knowledge-qa?id=${record.id}&token=${await TokenService.getToken()}`);
            window.open(path);
          }}>{value}</Button>;
        }
      }),
      AtcolTextarea({ title: '提示词', dataIndex: 'prompt', width: undefined }),
      AtcolToggle({ title: '禁用', dataIndex: 'disable' })
    ],
  }));

  const { pickMultipleObject } = usePickAutoObject();

  const addKnowledgeBase = useStableCallback(async () => {
    /*找到当前选中的问答机器人记录，一会插入中间表数据需要用到*/
    const selectQaBotRecord = await getNewestValue(option.select.setStateSelectedRow);
    if (!selectQaBotRecord) {
      showError('请选择要添加知识库的问答机器人');
      return;
    }

    /*找到所有已经添加过的知识库，用来排除查询*/
    const existKbCodes = await (async () => {
      const resp = await http.post<{ list: iKnowledgeRelQaBase[] }>('/general/rel_qa_base/list', { all: true, filters: [{ id: '01', field: 'qaId', operator: '=', value: selectQaBotRecord.id }] });
      return resp.data.list.map(i => i.kbCode);
    })();

    await pickMultipleObject({
      title: '选择知识库',
      config: () => ({
        ...createKnowledgeBaseConfig(),
        queryParam: !existKbCodes.length ? {} : {
          filters: [
            {
              field: 'code',
              operator: 'not in',
              value: existKbCodes,
            }
          ]
        }
      }),
      handleConfirm: async (selectKbRecords: iKnowledgeBaseRecord[]) => {
        const insertRows = selectKbRecords.map(kbRecord => ({
          qaId: selectQaBotRecord.id,
          kbCode: kbRecord.code,
          kbName: kbRecord.name,
        }));
        await http.post('general/rel_qa_base/batch_insert', { rows: insertRows });
        message.success("添加成功");
        await kbOption.methods.reload();
      }
    });
  });

  const kbOption = useAutoOption(() => ({
    module: 'rel_qa_base',
    columns: [
      AtcolInput({ title: '知识库名称', dataIndex: 'kbName' }),
      AtcolDatetime({ title: '创建时间', dataIndex: 'createdAt' }),
      AtcolInput({ title: '创建人', dataIndex: 'createdByName' }),
    ],
    parentOption: option,
    parentKeyMap: {
      qaId: 'id',
      qaName: 'name',
    },
    showCreateButton: false,
    showEditButton: false,
    buttons: [
      {
        render: () => (
          <Button type="primary" onClick={addKnowledgeBase}>
            <PlusOutlined/>
            <span>添加知识库</span>
          </Button>
        )
      }
    ]
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card style={{ marginBottom: '1em' }}>
        <AutoTable option={option}/>
      </Card>
      <Card>
        <AutoTable option={kbOption}/>
      </Card>
    </div>
  );
}
