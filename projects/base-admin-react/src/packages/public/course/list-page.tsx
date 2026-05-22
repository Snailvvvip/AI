import {CourseData} from "./course.utils";
import {CourseList} from "./CourseList";

export default () => {
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white' }}>
      <CourseList courses={CourseData}/>
    </div>
  );
}
