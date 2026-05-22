import {Card, Tabs, TabsProps} from "antd";
import {useCacheState} from "../../uses/useCacheState";
import {PosList} from "./PosList";
import {PosTree} from "./PosTree";

export default () => {

  const [view, setView] = useCacheState({ initialValue: "list", cacheKey: "pos-view-type" });

  const items: TabsProps['items'] = [
    {
      key: 'list',
      label: '列表视图',
      children: <PosList/>
    },
    {
      key: 'tree',
      label: '树形视图',
      children: <PosTree posPageView={view}/>
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
