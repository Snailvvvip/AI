import {Button, Card, notification} from "antd";
import {createReimburseConfig, iReimburseRecord} from "./reimburse.utils";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import React, {useContext} from "react";
import {router} from "../../home/routes";
import {http} from "../../utils/http";
import {UserInfoContext} from "../user/user.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const userInfo = useContext(UserInfoContext);

  const createReimburseRecord = async () => {
    if (!userInfo?.id) {
      notification.error({ message: '用户信息为空！' });
      return;
    }
    const resp = await http.post<{ result: iReimburseRecord }>('/reimburse/insert', {
      title: '新建报销单',
      user_id: userInfo.id,
    });
    await router.navigate(`/pages/reimburse/reimburse-detail?id=${resp.data.result.id}&editing=Y`);
  };

  const option = useAutoOption(() => ({
    ...createReimburseConfig(),
    showCreateButton: false,
    showEditButton: false,
    buttons: [
      {
        label: '智能新建',
        render: () => (
          <Button onClick={() => router.navigate('/pages/reimburse/reimburse-batch')} key={1}>
            <PlusOutlined/>
            <span>智能新建</span>
          </Button>
        ),
      },
      {
        label: '新建报销单',
        render: () => (
          <Button type="primary" onClick={createReimburseRecord} key={2}>
            <PlusOutlined/>
            <span>新建报销单</span>
          </Button>
        ),
      },
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
