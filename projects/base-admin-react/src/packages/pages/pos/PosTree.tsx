import {useEffect, useMemo, useState} from "react";
import {http} from "../../utils/http";
import {Table} from "antd";
import {iPosCascadeRecord, iPosRecord, PosColumns} from "./pos.utils";
import {showError} from "../../utils/showError";
import {PageSpin} from "../../components/PageSpin";

export const PosTree = (props: { posPageView: string }) => {

  const [loading, setLoading] = useState(false);

  const [posRecordList, setPosRecordList] = useState([] as iPosRecord[]);

  const [expandedKeys, setExpandedKeys] = useState([] as string[]);

  const reloadPosRecordList = async () => {
    setLoading(true);
    try {
      const resp = await http.post<{ list: iPosRecord[] }>('/pos/list', { all: true });
      setPosRecordList(resp.data.list);
    } catch (e: any) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {if (props.posPageView === 'tree') {reloadPosRecordList();}}, [props.posPageView]);

  const posCascadeRecordList = useMemo((): iPosCascadeRecord[] => {
    if (!posRecordList || posRecordList.length === 0) {
      return [];
    }

    // 构建一个映射，方便查找节点
    const code2pos = {} as Record<string, iPosRecord | undefined>;
    const code2children = {} as Record<string, iPosRecord[] | undefined>;
    posRecordList.forEach(org => {
      code2pos[org.code] = org;
      if (org.parent_code) {
        if (!code2children[org.parent_code]) {code2children[org.parent_code] = [];}
        code2children[org.parent_code]!.push(org);
      }
    });

    function getChildren(code: string): iPosCascadeRecord[] {
      const childrenOrgRecordList = code2children[code];
      if (!childrenOrgRecordList) {return [];}
      return childrenOrgRecordList.map(item => {
        return {
          ...item,
          children: getChildren(item.code)
        };
      });
    }

    const result = posRecordList.filter(i => i.parent_code === '0').map((org): iPosCascadeRecord => {
      return {
        ...org,
        children: getChildren(org.code),
      };
    });

    setExpandedKeys(result.map(i => i.code));

    return result;
  }, [posRecordList]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: '0', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PageSpin/>
        </div>
      )}
      <Table
        rowKey="code"
        columns={PosColumns}
        expandable={{ expandedRowKeys: expandedKeys, onExpandedRowsChange: keys => setExpandedKeys(keys as any) }}
        dataSource={posCascadeRecordList}
        pagination={false}
      />
    </div>
  );
};
