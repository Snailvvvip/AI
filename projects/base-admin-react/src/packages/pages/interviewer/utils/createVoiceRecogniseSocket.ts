import {defer, DFD} from "@peryl/utils/defer";
import {uuid} from "@peryl/utils/uuid";
import {message} from "antd";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../../env/env";
import {getErrorMessage, showError} from "../../../utils/showError";

/*
* 创建一个用于音频识别的工具对象，会调用后端的websocket接口识别音频内容
*/
export function createVoiceRecogniseSocket(
  {
    userId,
    onMessage,
    onOpen,
    onCreated,
    onError,
    onClose,

    onSpeechStarted,
    onSpeechStoped,
    onSpeechContent,
    onSpeechCompleted,
  }: iVoiceRecogniseParam
) {
  let dfd: DFD<WebSocket> | null = null;
  const send = async (pcmData: Int16Array) => {
    if (!dfd) {
      const _dfd = dfd = defer<WebSocket>();
      const messageKey = uuid();
      message.info({ content: '开始连接 WebSocket', key: messageKey });
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const _ws = new WebSocket(pathJoin(env.baseURL, "/ws_voice_recognise").replace(/^https?/, protocol) + `?user_id=${userId}`);
        onCreated?.(_ws);

        _ws.onmessage = function (event) {
          onMessage?.(event);
          const speechData: any = JSON.parse(event.data);
          switch (speechData.type) {
            case 'speech_started':
              onSpeechStarted?.(speechData.item_id);
              break;
            case 'speech_stopped':
              onSpeechStoped?.(speechData.item_id);
              break;
            case 'speech_content':
              onSpeechContent?.(speechData.item_id, speechData.content);
              break;
            case 'speech_completed':
              onSpeechCompleted?.(speechData.item_id, speechData.content);
          }

        };
        _ws.onclose = function () {onClose?.();};

        let _isWsReady = false;
        _ws.onopen = function () {
          if (!_isWsReady) {
            /*下面这段代码只执行一次，用_isWsReady变量来标识*/
            _dfd.resolve(_ws);
            _isWsReady = true;
            onOpen?.(_ws);
          }
        };
      } catch (e) {
        showError(`Websocket 连接失败：` + getErrorMessage(e));
        _dfd.reject(e);
        onError?.(e);
      } finally {
        message.destroy(messageKey);
      }
    }
    const ws = await dfd.promise;
    // console.log("pcmData", JSON.stringify(Array.from(pcmData)));
    ws.send(JSON.stringify(Array.from(pcmData)));
  };
  const close = async () => {
    if (!dfd) {
      return;
    } else {
      try {
        const ws = await dfd.promise;
        ws.close();
        message.success("Websocket关闭成功");
        dfd = null;
      } catch (e) {
        showError(`Websocket关闭失败：` + getErrorMessage(e));
      }
    }
  };
  return {
    send,
    close,
  };
}

export interface iVoiceRecogniseParam {
  userId: string | number, /*用户的id，用于标记哪个用户正在调用websocket连接进行语音识别*/
  onMessage?: (event: MessageEvent) => void, /*接收到后端返回的websocket消息时调用*/
  onOpen?: (ws: WebSocket) => void, /*websocket连接成功时调用*/
  onClose?: () => void, /*websocket连接关闭时调用*/
  onCreated?: (ws: WebSocket) => void, /*websocket连接创建时调用*/
  onError?: (e: any) => void, /*websocket连接出错时调用*/

  onSpeechStarted?: (item_id: string) => void, /*语音开始识别时调用*/
  onSpeechStoped?: (item_id: string) => void, /*语音停止识别时调用*/
  onSpeechContent?: (item_id: string, content: string) => void, /*语音内容识别时调用*/
  onSpeechCompleted?: (item_id: string, content: string) => void, /*语音识别完成时调用*/

  onSpeechSentenceChange?: (sentences: string[]) => void,/*说话的句子发生变化时触发动作*/
  onLastSpeechSentenceChange?: (sentence: string | null) => void,/*最后一句话发生变化时触发动作*/
}
