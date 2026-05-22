import {iProjectRecord, ProjectColumns} from "../pages/project/project.utils";
import {Table} from "antd";
import {useState} from "react";
import {useStrictMounted} from "../uses/useStrictMounted";
import {showError} from "../utils/showError";
import {useLoadingState} from "../uses/useLoadingState";
import {http} from "../utils/http";
import {ColInput} from "./Columns";
import {Link} from "react-router";

export const ProjectList = (props: { projIdList: string[] }) => {

  const { loading, isLoading } = useLoadingState();
  const [projectList, setProjectList] = useState([] as iProjectRecord[]);

  useStrictMounted(async () => {
    const closeLoading = loading();
    try {
      const resp = await http.post<{ list: iProjectRecord[] }>('/project/list', { all: true, filters: { id: props.projIdList } });
      setProjectList(resp.data.list);
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  });

  return (
    <Table
      rowKey="id"
      loading={isLoading}
      columns={[
        ColInput("项目名称", "name", {
          render: (_, record) => <Link to={`/pages/project/project?id=${record.id}`}>{_}</Link>,
        }),
        ...ProjectColumns.filter(col => col.title === '项目负责人' || col.title === '项目描述')
      ]}
      dataSource={projectList}
      pagination={false}
      scroll={{ x: 'max_content' }}
    />
  );
};
