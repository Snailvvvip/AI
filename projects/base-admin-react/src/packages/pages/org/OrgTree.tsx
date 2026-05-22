import {useEffect, useMemo, useState} from "react";
import {iOrgCascadeRecord, iOrgRecord, OrgColumns} from "./org.utils";
import {http} from "../../utils/http";
import {notification, Table} from "antd";
import {PageSpin} from "../../components/PageSpin";

export const OrgTree = (props: { orgPageView: string }) => {

  const [loading, setLoading] = useState(false);

  const [orgRecordList, setOrgRecordList] = useState([] as iOrgRecord[]);

  const reloadOrgRecordList = async () => {
    setLoading(true);
    try {
      const resp = await http.post<{ list: iOrgRecord[] }>('/org/list', { all: true });
      setOrgRecordList(resp.data.list);
      console.log(resp.data.list);
    } catch (e: any) {
      console.error(e);
      notification.error({ message: e.message || JSON.stringify(e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {if (props.orgPageView === 'tree') {reloadOrgRecordList();}}, [props.orgPageView]);

  const orgCascadeRecordList = useMemo((): iOrgCascadeRecord[] => {
    if (!orgRecordList || orgRecordList.length === 0) {
      return [];
    }

    // 构建一个映射，方便查找节点
    const code2org = {} as Record<string, iOrgRecord | undefined>;
    const code2children = {} as Record<string, iOrgRecord[] | undefined>;
    orgRecordList.forEach(org => {
      code2org[org.code] = org;
      if (org.parent_code) {
        if (!code2children[org.parent_code]) {code2children[org.parent_code] = [];}
        code2children[org.parent_code]!.push(org);
      }
    });

    function getChildren(code: string): iOrgCascadeRecord[] {
      const childrenOrgRecordList = code2children[code];
      if (!childrenOrgRecordList) {return [];}
      return childrenOrgRecordList.map(item => {
        return {
          ...item,
          children: getChildren(item.code)
        };
      });
    }

    return orgRecordList.filter(i => i.parent_code === 'ORG001').map((org): iOrgCascadeRecord => {
      return {
        ...org,
        children: getChildren(org.code),
      };
    });

  }, [orgRecordList]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: '0', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PageSpin/>
        </div>
      )}
      <Table
        rowKey="code"
        columns={OrgColumns}
        dataSource={orgCascadeRecordList}
        pagination={false}
      />
    </div>
  );
};
