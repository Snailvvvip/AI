import {Card, Tabs, TabsProps} from "antd";
import {createProjectConfig} from "./project.utils";
import {useCacheState} from "../../uses/useCacheState";
import {ProjectMemberList} from "./ProjectMemberList";
import {ProjectSpentList} from "./ProjectSpentList";
import {useQuery} from "../../uses/useQuery";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const pageParam = useQuery();

  const projectOption = useAutoOption(() => ({
    ...createProjectConfig(),
    pageSize: 5,
    queryParam: !pageParam.id ? undefined : {
      queries: [{ field: 'id', operator: '=', value: pageParam.id }]
    }
  }));

  const [view, setView] = useCacheState({ initialValue: "list", cacheKey: "user-view-type" });

  const items: TabsProps['items'] = [
    {
      key: 'list',
      label: '项目成员',
      children: <ProjectMemberList projectOption={projectOption}/>
    },
    {
      key: 'tree',
      label: '项目费用',
      children: <ProjectSpentList projectOption={projectOption}/>
    }
  ];

  return (
    <div style={{ padding: '1em' }}>
      <Card style={{ marginBottom: '1em' }}>
        <AutoTable option={projectOption}/>
      </Card>
      <Card>
        <Tabs activeKey={view} items={items} onChange={setView} destroyOnHidden/>
      </Card>
    </div>
  );
};
