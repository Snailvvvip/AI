import {useContext, useState} from "react";
import {iUserRecord, UserColumns, UserInfoContext} from "../pages/user/user.utils";
import {http} from "../utils/http";
import {iPosRecord} from "../pages/pos/pos.utils";
import {showError} from "../utils/showError";
import {useLoadingState} from "../uses/useLoadingState";
import {Table} from "antd";
import {useStrictMounted} from "../uses/useStrictMounted";

export const DirectSubordinates = () => {
  const userInfo = useContext(UserInfoContext)!;

  const [subordinates, setSubordinates] = useState([] as iUserRecord[]);

  const { loading, isLoading } = useLoadingState();

  const reload = async () => {
    const closeLoading = loading();
    try {
      const resp = await http.post<{ list: iPosRecord[] }>('/pos/list', { all: true, filters: { parent_code: userInfo.pos!.code } });
      const subordinatePosCodes = resp.data.list.map(i => i.code);
      const resp2 = await http.post<{ list: iUserRecord[] }>('/user/list', { all: true, filters: { pos_code: subordinatePosCodes } });
      setSubordinates(resp2.data.list);
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  };

  useStrictMounted(async () => {
    await reload();
  });

  return (
    <Table
      loading={isLoading}
      columns={UserColumns}
      dataSource={subordinates}
      pagination={false}
      scroll={{ x: 'max_content' }}
    />
  );
};
