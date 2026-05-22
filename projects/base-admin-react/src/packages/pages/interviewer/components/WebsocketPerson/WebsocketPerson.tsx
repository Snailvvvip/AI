import {useCallback, useEffect, useState} from "react";
import {Button, Input, message, Space} from "antd";
import './websocket-person.scss';
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../../../env/env";
import SendOutlined from '@ant-design/icons/SendOutlined';
import {useLoadingState} from "../../../../uses/useLoadingState";
import {showError} from "../../../../utils/showError";

interface iPersonMessage {
  name: string,
  context: string,
}

export const WebsocketPerson = (props: { name: string }) => {

  const { loading: connectLoading, isLoading: isConnecting } = useLoadingState();

  const [ws, setWs] = useState(null as WebSocket | null);

  const [text, setText] = useState("");

  const [messageList, setMessageList] = useState([] as iPersonMessage[]);

  /*开始连接websocket*/
  const startConnect = useCallback(async () => {
      if (ws) {return;}
      const closeConnecting = connectLoading();
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const _ws = new WebSocket(pathJoin(env.baseURL, "/ws").replace(/^https?/, protocol) + `?name=${props.name}`);
        _ws.onmessage = function (event) {
          const personMessage: iPersonMessage = JSON.parse(event.data);
          console.log(`${props.name} 收到消息`, personMessage);
          setMessageList(prevList => [...prevList, personMessage]);
        };
        setWs(_ws);
        message.success(`${props.name} 连接成功`);
      } catch (e) {
        showError(e);
      } finally {
        closeConnecting();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ws, props.name]
  );

  /*发送消息*/
  const sendMessage = useCallback(async () => {
    if (!ws) {return;}
    if (!text.trim().length) {return;}
    const personMessage: iPersonMessage = { name: props.name, context: text };
    console.log(`${props.name} 发送消息`, personMessage);
    ws.send(JSON.stringify(personMessage));
    setMessageList(prevList => [...prevList, personMessage]);
    setText('');
  }, [ws, props.name, text]);

  /*关闭连接*/
  const closeConnect = useCallback(async () => {
    if (!ws) {return;}
    ws.close();
    setWs(null);
    message.success(`${props.name} 已断开连接`);
  }, [ws, props.name]);

  useEffect(() => {
    return () => {closeConnect();};
  }, [closeConnect]);

  return (
    <div className="websocket-person">
      <Space direction="vertical" style={{ display: 'flex' }}>
        <div className="websocket-person-name">
          {props.name}
        </div>
        <div className="websocket-person-message-list">
          {messageList.map((item, index) => (
            item.name === props.name ? (
              <div className="websocket-person-message-item" data-role="self" key={index}>
                <div className="websocket-person-message-content">{item.context}</div>
                <div className="websocket-person-message-name">{item.name}</div>
              </div>
            ) : (
              <div className="websocket-person-message-item" data-role="other" key={index}>
                <div className="websocket-person-message-name">{item.name}</div>
                <div className="websocket-person-message-content">{item.context}</div>
              </div>
            )
          ))}
        </div>
        <Input.TextArea value={text} onChange={e => setText(e.target.value)} disabled={!ws}/>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color="primary" disabled={!!ws} onClick={startConnect} loading={isConnecting}>开始连接</Button>
            <Button danger disabled={!ws} onClick={closeConnect}>断开连接</Button>
          </Space>
          <Button onClick={sendMessage} type="primary" disabled={!ws}>
            <SendOutlined/>
            <span>发送</span>
          </Button>
        </div>
      </Space>
    </div>
  );
};
