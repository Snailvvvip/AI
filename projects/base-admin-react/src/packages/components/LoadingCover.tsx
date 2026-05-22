import {Spin} from "antd";
import './LoadingCover.scss';

export function LoadingCover() {
  return (
    <div className="loading-cover"><Spin/></div>
  );
}
