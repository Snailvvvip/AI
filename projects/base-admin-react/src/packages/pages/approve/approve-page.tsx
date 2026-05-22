import {Card, Tabs, TabsProps} from "antd";
import {useCacheState} from "../../uses/useCacheState";
import {ApproveList} from "./ApproveList";
import {ApplyList} from "./ApplyList";

export default () => {

  const [view, setView] = useCacheState({ initialValue: "approve", cacheKey: "approve-view-type" });

  const items: TabsProps['items'] = [
    {
      key: 'approve',
      label: '我审批的',
      children: <ApproveList/>
    },
    {
      key: 'apply',
      label: '我申请的',
      children: <ApplyList/>
    }
  ];

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <Tabs activeKey={view} items={items} onChange={setView} destroyOnHidden/>
      </Card>
    </div>
  );
}
