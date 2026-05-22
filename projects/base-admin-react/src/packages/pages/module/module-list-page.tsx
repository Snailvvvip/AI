import {Button, Card, message} from "antd";
import {useDrawer} from "../../uses/useDrawer";
import {iBaseRecord} from "../../utils/BaseRecord";
import {MonacoEditor} from "../../components/MonacoEditor/MonacoEditor";
import './module-list-page.scss';
import {http} from "../../utils/http";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const { openDrawer } = useDrawer();

  const editRecordModuleConfig = (record: iModuleRecord) => {
    let editValue = record.moduleConfig;
    const Content = () => {
      return (
        <div style={{ height: '100%' }}>
          <MonacoEditor
            value={editValue}
            onChange={val => editValue = val}
            language="json"
          />
        </div>
      );
    };
    openDrawer({
      drawerClassName: 'module-list-drawer',
      handleConfirm: async () => {
        if (!editValue?.trim().length) {
          message.error("请输入配置信息！");
          return false;
        }
        try {
          JSON.parse(editValue ?? '');
        } catch (e) {
          message.error("JSON格式不正确！");
          return false;
        }
        const newRow = { ...record, moduleConfig: editValue };
        await http.post<{ row: iModuleRecord }>('/general/module/update', { row: newRow });
        await option.methods.reload();
      },
      content: <Content/>
    });
  };

  const option = useAutoOption(() => ({
    module: 'module',
    columns: [
      AtcolInput({ title: '模块名称', dataIndex: 'label' }),
      AtcolInput({ title: '模块标识', dataIndex: 'code' }),
      AtcolInput({
        title: '模块配置',
        dataIndex: 'moduleConfig',
        editable: false,
        inlineRender: ({ record }) => (<Button type="link" style={{ padding: 0 }} onClick={() => editRecordModuleConfig(record as any)}>编辑配置</Button>),
        inlineEditor: () => '请先保存'
      }),
      AtcolTextarea({ title: '模块备注', dataIndex: 'remarks' }),
    ],
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
    </div>
  );
}

interface iModuleRecord extends iBaseRecord {
  label?: string,
  code?: string,
  remarks?: string,
  moduleConfig?: string,
}
