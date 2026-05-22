import {delay} from "@peryl/utils/delay";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {convertGraphMessageToChatMessage, iChatbotInnerProps, iChatBubbleMessage, iChatGraphState} from "./chatbot.utils";
import {useLoadingState} from "../../uses/useLoadingState";
import {showError} from "../../utils/showError";
import {getNewestValue} from "../../uses/getNewestValue";
import {iChatbotConversation} from "./useChatbotConversation";

export function useChatbotMessages(
  {
    chatbotConversation: { conversationId },
    props: {
      userId,
      behavior: {
        converseSaver: { queryConversationMessages },
      }
    }
  }: {
    chatbotConversation: iChatbotConversation,
    props: iChatbotInnerProps,
  }
) {

  /*是否正在加载消息列表数据*/
  const { loading: openMessageLoading, isLoading: isLoadingMessage } = useLoadingState();

  /*对bubble消息数组的容器div节点引用*/
  const bubbleListParentDomRef = useRef(null as null | HTMLDivElement);

  /*消息数组*/
  const [_messages, setMessages] = useState([] as iChatBubbleMessage[]);
  /*最后的消息（可能有值）*/
  const [tempMessage, setTempMessage] = useState(null as null | iChatBubbleMessage);
  /*中断信息，如果中断信息存在，则将中断信息拼接到消息数组末尾，在聊天框中显示中断信息组件，用于用户操作以便恢复中断*/
  const [interruptValue, setInterruptValue] = useState(null as null | Record<string, any>);

  /*完整的消息数组，如果最后的消息有值，就拼到消息数组末尾，否则就是消息数组*/
  const messages: iChatBubbleMessage[] = useMemo(() => {
    let result = _messages;
    if (!!tempMessage) {
      result = [...result, tempMessage];
    }
    if (!!interruptValue) {
      result = [...result, {
        status: 'local', message: {
          id: '',
          role: 'interrupt',
          content: interruptValue,
        }
      }];
    }
    return result;
  }, [tempMessage, interruptValue, _messages]);

  /*令对话历史滚动到底部*/
  const scrollToBottom = useCallback(() => {
    const bubbleListDom = bubbleListParentDomRef.current?.children[0];
    if (!!bubbleListDom) {
      bubbleListDom.scrollTop = bubbleListDom.scrollHeight;
    }
  }, []);

  /**
   * 重新加载消息数组数据
   * @param conversationId  会话的id
   */
  const reloadMessages = useCallback(async (conversationId: string | null | undefined) => {
    if (!conversationId) {
      setMessages([]);
      setTempMessage(null);
      setInterruptValue(null);
    } else {
      const closeLoadingMessage = openMessageLoading();
      try {
        const { messages, interrupts } = await queryConversationMessages({ conversationId, userId });
        console.log("reloadMessages ==>> ", { messages, interrupts });
        setMessages(messages);
        setInterruptValue(interrupts);
        /*等渲染完毕之后，滚动到底部*/
        await delay(78);
        scrollToBottom();
      } catch (e) {
        showError(e);
      } finally {
        closeLoadingMessage();
      }
    }
  }, [openMessageLoading, scrollToBottom, queryConversationMessages, userId]);

  /*处理中断变化*/
  const onInterruptChange = useCallback(async (newGraphState: iChatGraphState) => {
    console.log('onInterruptChange', newGraphState);
    setMessages(prevMessages => [...prevMessages, ...newGraphState.messages.map(convertGraphMessageToChatMessage)]);
    setInterruptValue(newGraphState.__interrupt__?.[0]?.value);
    await delay(78);
    scrollToBottom();
  }, [scrollToBottom]);

  /*当会话id变化时，重新加载会话数据*/
  useEffect(
    () => {reloadMessages(conversationId);},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId]
  );

  /*要获取消息数组以及最后的消息，要通过异步方法获取最新的值，避免因为异步调用导致的闭包问题拿到旧值*/
  // 获取最新的消息列表数据
  const getNewestMessages = useCallback(async () => getNewestValue(setMessages), []);
  // 获取最新的临时消息
  const getNewestTempMessage = useCallback(async () => getNewestValue(setTempMessage), []);

  return {
    getNewestMessages,
    getNewestTempMessage,
    messages,
    setMessages,
    setTempMessage,
    interruptValue,
    setInterruptValue,
    scrollToBottom,
    isLoadingMessage,
    openMessageLoading,
    onInterruptChange,
  };
}

export type iChatbotMessages = ReturnType<typeof useChatbotMessages>;
