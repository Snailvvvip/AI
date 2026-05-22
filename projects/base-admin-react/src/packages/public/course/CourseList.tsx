import {iCourseRecord} from "./course.utils";
import './CourseList.scss';
import {useStableCallback} from "../../uses/useStableCallback";
import {pathJoin} from "@peryl/utils/pathJoin";

export const CourseList = (props: { courses: iCourseRecord[] }) => {

  const _openDetail = useStableCallback((id: string) => {
    window.open(pathJoin(window.location.origin, __webpack_public_path__, `/public/course/detail?id=${id}`));
  });

  return (
    <div className="course-list">
      {props.courses.map(item => {
        const openDetail = () => _openDetail(item.id);
        return (
          <div className="course-list-item" key={item.id} onClick={openDetail}>
            <div className="course-list-item-left">
              <img src={item.primaryImage} alt={item.name}/>
            </div>
            <div className="course-list-item-right">
              <div className="course-list-item-title">{item.name}</div>
              <div className="course-list-item-intro">{item.introduce}</div>
              <div className="course-list-item-info">
                <div>
                  {/*<div>{item.status}:</div>*/}
                  {/*<div data-highlight>{item.upgradeType}</div>*/}
                  {/*<div>|</div>*/}
                  {/*<div>难度:</div>*/}
                  {/*<div data-highlight>{item.difficulty}</div>*/}
                  {/*<div>|</div>*/}
                  {/*<div>课时:</div>*/}
                  {/*<div>约 <span data-highlight>{item.studyHours}</span> 小时</div>*/}
                </div>
                <div>
                  <button>查看详情</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
