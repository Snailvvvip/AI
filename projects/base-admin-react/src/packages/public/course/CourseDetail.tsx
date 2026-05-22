import {iCourseRecord} from "./course.utils";
import './CourseDetail.scss';
import imageLearningSkills from './images/title_learning_skills.png';
import imageProjectIntroduce from './images/title_project_introduce.png';
import imageProjectArchitecture from './images/title_project_architecture.png';
import imageVideoIntroduce from './images/title_video_introduce.png';
import {CourseTextLine} from "./CourseTextLine";
import {Carousel, CarouselItem} from 'plain-design';
import 'plain-design/dist/plain-design.min.css';
import {useCallback} from "react";

export const CourseDetail = ({ course }: { course: iCourseRecord }) => {

  const contract = useCallback(() => {window.open('https://www.renshengtech.com/#contact-heading');}, []);

  return (
    <div className="course-detail">
      <div
        className="course-intro-head"
        style={{
          backgroundImage: `linear-gradient(0deg, #FFFFFF 0%, ${course.primaryColor} 100%)`,
          height: '300px'
        }}
      />
      <div className="course-intro-body">

        <div className="course-intro-title">
          {course.name}
        </div>

        <div className="course-intro-introduce">
          {course.introduce}
        </div>

        <div className="course-intro-info">
          <div>
            {/*<div>{course.status}:</div>*/}
            {/*<div data-highlight>{course.upgradeType}</div>*/}
            {/*<div>|</div>*/}
            {/*<div>难度:</div>*/}
            {/*<div data-highlight>{course.difficulty}</div>*/}
            {/*<div>|</div>*/}
            {/*<div>课时:</div>*/}
            {/*<div>约 <span data-highlight>{course.studyHours}</span> 小时</div>*/}
          </div>
          <div>
            <button onClick={contract}>立即咨询</button>
          </div>
        </div>

        <div className="course-intro-section">
          <div className="course-intro-section-title">
            <img src={imageProjectIntroduce} alt="项目介绍"/>
          </div>
          <div>
            <ul>
              {course.descriptions.map((item, index) => (
                <li key={index}><CourseTextLine text={item}/></li>
              ))}
            </ul>
          </div>
        </div>

        {!!course.skills.length && (
          <div className="course-intro-section">
            <div className="course-intro-section-title">
              <img src={imageLearningSkills} alt="掌握技能"/>
            </div>
            <div>
              <ul>
                {course.skills.map((item, index) => (
                  <li key={index}><CourseTextLine text={item}/></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {(!!course.architectures.length || !!course.imageUrls.length) && (
          <div className="course-intro-section">
            <div className="course-intro-section-title">
              <img src={imageProjectArchitecture} alt="项目架构"/>
            </div>
            <div>
              {!!course.architectures.length && (
                <ul>
                  {course.architectures.map((item, index) => (
                    <li key={index}><CourseTextLine text={item}/></li>
                  ))}
                </ul>
              )}
            </div>
            {!!course.imageUrls.length && (
              <Carousel>
                {course.imageUrls.map((item, index) => (
                  <CarouselItem key={index}>
                    <img src={item} alt="项目架构" style={{ width: '100%' }}/>
                  </CarouselItem>
                ))}
              </Carousel>
            )}
          </div>
        )}

        <div className="course-intro-section">
          <div className="course-intro-section-title">
            <img src={imageVideoIntroduce} alt="视频介绍"/>
          </div>
          <iframe title="视频介绍" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '17px' }} src={course.videoUrl + "&autoplay=0"} scrolling="no" frameBorder="no" allowFullScreen={true}/>
        </div>

      </div>
    </div>
  );
};
