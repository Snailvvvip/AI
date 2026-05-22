import {useChatbotStyles} from "./useChatbotStyles";
import {iChatbotState, useChatbotState} from "./useChatbotState";
import {iChatbotConversation, useChatbotConversation} from "./useChatbotConversation";
import {iChatbotMessages, useChatbotMessages} from "./useChatbotMessages";
import {iChatbotRequest, useChatbotRequest} from "./useChatbotRequest";
import {iChatbotSide, useChatbotSide} from "./useChatbotSide";
import {iChatbotBody, useChatbotBody} from "./useChatbotBody";
import {iChatbotSender, useChatbotSender} from "./useChatbotSender";
import {iChatbotProps} from "./chatbot.utils";
import './Chatbot.scss';
import {iChatbotVoiceRecorder, useChatbotVoiceRecorder} from "./useChatbotVoiceRecorder";
import React, {useImperativeHandle} from "react";
import {useChatbotProps} from "./useChatbotProps";

export const Chatbot = React.forwardRef<iChatbotInstance, iChatbotProps>((_props: iChatbotProps, ref) => {

  /*页面样式*/
  const chatbotStyle = useChatbotStyles();
  const { styles } = chatbotStyle;

  /*预处理props默认值*/
  const props = useChatbotProps(_props);

  /*组件内部状态*/
  const chatbotState = useChatbotState();

  /*会话管理*/
  const chatbotConversation = useChatbotConversation({ chatbotState, props });

  /*消息管理*/
  const chatbotMessages = useChatbotMessages({ chatbotConversation, props });

  /*处理请求*/
  const chatbotRequest = useChatbotRequest({ chatbotState, chatbotMessages, chatbotConversation, props });

  /*音频识别*/
  const chatbotVoiceRecorder = useChatbotVoiceRecorder({ props, chatbotState, chatbotRequest });

  /*侧边栏内容*/
  const chatbotSide = useChatbotSide({ chatbotStyle, chatbotState, chatbotConversation, props });

  /*主体内容*/
  const chatbotBody = useChatbotBody({ chatbotStyle, chatbotMessages, chatbotConversation, chatbotRequest });

  /*输入框*/
  const chatbotSender = useChatbotSender({ chatbotStyle, chatbotRequest, chatbotState, chatbotVoiceRecorder });

  const ins: iChatbotInstance = {
    state: chatbotState,
    conversation: chatbotConversation,
    messages: chatbotMessages,
    request: chatbotRequest,
    voiceRecorder: chatbotVoiceRecorder,
    side: chatbotSide,
    body: chatbotBody,
    sender: chatbotSender,
  };

  useImperativeHandle(ref, () => ins);

  return (
    <div className={styles.layout + " chatbot"} style={props.style}>
      {chatbotSide.sideContent}
      <div className={styles.chat}>
        {chatbotBody.messageListContent}
        {chatbotSender.senderBodyContent}
      </div>
    </div>
  );
});

export interface iChatbotInstance {
  state: iChatbotState,
  conversation: iChatbotConversation,
  messages: iChatbotMessages,
  request: iChatbotRequest,
  voiceRecorder: iChatbotVoiceRecorder,
  side: iChatbotSide,
  body: iChatbotBody,
  sender: iChatbotSender,
}
