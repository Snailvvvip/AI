import {Card} from "antd";
import {createApiSecretConfig} from "./api-secret.utils";
import {useContext} from "react";
import {UserInfoContext} from "../user/user.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const userInfo = useContext(UserInfoContext)!;

  const option = useAutoOption(() => ({
    ...createApiSecretConfig(),
    queryParam: {
      queries: [{ field: 'createdBy', operator: '=', value: userInfo.id }]
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
