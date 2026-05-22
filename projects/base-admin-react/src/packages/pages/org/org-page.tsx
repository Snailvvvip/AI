import {Card, Tabs, TabsProps} from "antd";
import {OrgList} from "./OrgList";
import {OrgTree} from "./OrgTree";
import {useCacheState} from "../../uses/useCacheState";

export default () => {

  const [view, setView] = useCacheState({ initialValue: "list", cacheKey: "org-view-type" });

  const items: TabsProps['items'] = [
    {
      key: 'list',
      label: '列表视图',
      children: <OrgList/>
    },
    {
      key: 'tree',
      label: '树形视图',
      children: <OrgTree orgPageView={view}/>
    }
  ];

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <Tabs activeKey={view} items={items} onChange={setView}/>
      </Card>
    </div>
  );
}
