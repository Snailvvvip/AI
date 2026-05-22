// @ts-ignore
import home01 from './home/images/home01.png';
// @ts-ignore
import home02 from './home/images/home02.png';
// @ts-ignore
import home03 from './home/images/home03.png';
import {message, Space} from "antd";

export default () => {
  return (
    <div style={{ padding: '1em' }}>
      <Space direction="vertical">
        <img src={home01} alt="" width="100%" onClick={() => message.warning('待完成')}/>
        <img src={home02} alt="" width="100%" onClick={() => message.warning('待完成')}/>
        <img src={home03} alt="" width="100%" onClick={() => message.warning('待完成')}/>
      </Space>
    </div>
  );
}
