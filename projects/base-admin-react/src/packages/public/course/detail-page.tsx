import {CourseData} from "./course.utils";
import {CourseDetail} from "./CourseDetail";
import {useQuery} from "../../uses/useQuery";
import {Alert} from "antd";

export default () => {

  const { id } = useQuery();
  if (!id) {return <Alert type="error" message="缺少页面参数ID"/>;}

  const course = CourseData.find(item => item.id === id);
  if (!course) {return <Alert type="error" message={`页面"${id}"不存在`}/>;}

  return (
    <CourseDetail course={course}/>
  );
}
