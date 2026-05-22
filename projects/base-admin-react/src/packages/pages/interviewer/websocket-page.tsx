import {Card} from "antd";
import {WebsocketPerson} from "./components/WebsocketPerson/WebsocketPerson";
import './websocket-page.scss';

export default () => {
  return (
    <div style={{ padding: '1em' }}>
      <Card title={<span>测试Websocket连接</span>}>
        <div className="websocket-person-list">
          <WebsocketPerson name="张三"/>
          <WebsocketPerson name="李四"/>
          <WebsocketPerson name="王五"/>
          <WebsocketPerson name="赵六"/>
        </div>
      </Card>
    </div>
  );
}
