import {Button, Card, notification} from "antd";
import {createHotelConfig} from "./hotel.utils";
import {createProjectConfig} from "../project/project.utils";
import {showError} from "../../utils/showError";
import {http} from "../../utils/http";
import {useContext} from "react";
import {UserInfoContext} from "../user/user.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";
import {usePickAutoObject} from "../../components/AutoTable/components/usePickAutoObject";

export default () => {

  const userInfo = useContext(UserInfoContext)!;

  const { pickSingleObject } = usePickAutoObject();

  async function hookHotel(record: Record<string, any>) {
    try {
      await pickSingleObject({
        title: '选择项目',
        config: createProjectConfig,
        handleConfirm: async (selectProject) => {
          try {
            await http.post('/book_hotel', {
              hotel_id: record.id,
              user_id: userInfo.id,
              proj_id: selectProject.id,
            });
            notification.success({ message: '酒店预定成功，已经创建审批单，审批通过将自动创建订单！' });
          } catch (e) {
            showError(e);
          }
        },
      });
    } catch (e) {
      showError(e);
    }
  }

  const option = useAutoOption(() => ({
    ...createHotelConfig(),
    showEditButton: false,
    showCreateButton: false,
    showDeleteButton: false,
    operations: (record) => <>
      <Button color="primary" variant="link" size="small" onClick={() => hookHotel(record)}>预定</Button>
    </>,
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
    </div>
  );
}
