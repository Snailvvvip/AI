import {useEffect, useMemo, useState} from "react";
import {http} from "../../utils/http";
import {Table} from "antd";
import {showError} from "../../utils/showError";
import {iUserCascadeRecord, iUserRecord, UserColumns} from "./user.utils";
import {PageSpin} from "../../components/PageSpin";

export const UserTree = (props: { userPageView: string }) => {

  const [loading, setLoading] = useState(false);

  const [userRecordList, setUserRecordList] = useState([] as iUserRecord[]);

  const [expandedKeys, setExpandedKeys] = useState([] as string[]);

  const reloadUserRecordList = async () => {
    setLoading(true);
    try {
      const resp = await http.post<{ list: iUserRecord[] }>('/user/list', { all: true });
      setUserRecordList(resp.data.list);
    } catch (e: any) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {if (props.userPageView === 'tree') {reloadUserRecordList();}}, [props.userPageView]);

  const userCascadeRecordList = useMemo((): iUserCascadeRecord[] => {
    if (!userRecordList || userRecordList.length === 0) {
      return [];
    }

    // 构建一个映射，方便查找节点
    const code2user = {} as Record<string, iUserRecord | undefined>;
    const code2children = {} as Record<string, iUserRecord[] | undefined>;
    userRecordList.forEach(item => {
      code2user[item.pos_code] = item;
      if (item.pos?.parent_code) {
        if (!code2children[item.pos.parent_code]) {code2children[item.pos.parent_code] = [];}
        code2children[item.pos.parent_code]!.push(item);
      }
    });

    function getChildren(code: string): iUserCascadeRecord[] {
      const childrenOrgRecordList = code2children[code];
      if (!childrenOrgRecordList) {return [];}
      return childrenOrgRecordList.map(item => {
        return {
          ...item,
          children: getChildren(item.pos_code)
        };
      });
    }

    const result = userRecordList.filter(i => i.pos?.parent_code === '0').map((org): iUserCascadeRecord => {
      return {
        ...org,
        children: getChildren(org.pos_code),
      };
    });

    setExpandedKeys(result.map(i => i.pos_code));

    return result;
  }, [userRecordList]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: '0', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PageSpin/>
        </div>
      )}
      <Table
        rowKey="pos_code"
        columns={UserColumns}
        expandable={{ expandedRowKeys: expandedKeys, onExpandedRowsChange: keys => setExpandedKeys(keys as any) }}
        dataSource={userCascadeRecordList}
        pagination={false}
      />
    </div>
  );
};
