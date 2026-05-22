import {Card} from "antd";
import {useContext} from "react";
import {UserInfoContext} from "../user/user.utils";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolText} from "../../components/AutoTable/columns/AtcolText";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

const createOrderConfig = (): iAutoOptionConfig => ({
  module: 'order',
  columns: [
    AtcolText({ title: '商品名称', dataIndex: 'name', width: 180 }),
    AtcolText({ title: '商品价格', dataIndex: 'price' }),
  ]
});

export default () => {

  const userInfo = useContext(UserInfoContext)!;

  const option = useAutoOption(() => ({
    ...createOrderConfig(),
    queryParam: {
      queries: [{ field: 'userId', operator: '=', value: userInfo.id }]
    },
    showOperateColumn: false,
    showCreateButton: false,
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
    </div>
  );
}
