import {Card, Tabs, TabsProps} from "antd";
import {useCacheState} from "../../uses/useCacheState";
import {UserList} from "./UserList";
import {UserTree} from "./UserTree";

export default () => {

  const [view, setView] = useCacheState({ initialValue: "list", cacheKey: "user-view-type" });

  const items: TabsProps['items'] = [
    {
      key: 'list',
      label: '列表视图',
      children: <UserList/>
    },
    {
      key: 'tree',
      label: '树形视图',
      children: <UserTree userPageView={view}/>
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
