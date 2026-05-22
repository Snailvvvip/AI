import {useCallback, useMemo, useState} from "react";
import {iChatbotInnerProps, iConversationRecord} from "./chatbot.utils";
import {message, notification} from "antd";
import {next_id} from "../../utils/next_id";
import {getNewestValue} from "../../uses/getNewestValue";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {iChatbotState} from "./useChatbotState";
import {showError} from "../../utils/showError";

/*会话管理*/
export function useChatbotConversation(
  {
    chatbotState: { isLoading },
    props: {
      userId, behavior: {
        converseSaver: {
          removeConversation: _removeConversation,
          queryConversationList: _queryConversationList,
          insertConversation: _insertConversation,
          generateConversationTitle: _generateConversationTitle
        }
      }
    },
  }: {
    chatbotState: iChatbotState,
    props: iChatbotInnerProps,
  }
) {

  /*会话列表数据*/
  const [conversations, setConversations] = useState([] as iConversationRecord[]);
  /*当前会话的id，可能没有值*/
  const [_conversationId, setConversationId] = useState(null as null | string | undefined);
  /*当前会话id，没有值就去会话列表数据中的第一天数据*/
  const conversationId = useMemo(() => _conversationId ?? conversations[0]?.id, [_conversationId, conversations]);

  /*新建会话*/
  const createConversation = useCallback(async (): Promise<void> => {
    if (isLoading) {
      message.error('消息正在请求中，您可以在请求完成后创建一个新的会话或立即中止它。');
      return;
    }
    /*从后端获取一个新的id，作为本次会话的id*/
    const newConversationId = await next_id();
    setConversations(prevConversations => [{ id: newConversationId, title: undefined, }, ...prevConversations,]);
    setConversationId(newConversationId);
  }, [isLoading]);

  /*删除会话*/
  const removeConversation = useCallback(async (conversationId: string) => {
    try {
      const flag = await _removeConversation({ conversationId, userId });
      /*如果返回false或者抛出异常，说明删除不成功*/
      if (flag === false) {return;}
      /*将会话从会话列表中和删除*/
      setConversations(prevConversations => prevConversations.filter(i => i.id !== conversationId));
      notification.success({ message: '删除成功' });
      /*找到当前选中的会话，判断是否与删除的会话是同一个*/
      const curConversationId = (await getNewestValue(setConversationId));
      /*是同一个的话*/
      if (curConversationId === conversationId) {
        const newestConversations = await getNewestValue(setConversations);
        if (!!newestConversations.length) {
          /*重新选中当前会话列表中第一个会话*/
          setConversationId(newestConversations[0].id);
        } else {
          /*当前会话列表中已经没有数据，新建一个会话*/
          await createConversation();
        }
      }
    } catch (e) {
      showError(e);
    }
  }, [_removeConversation, createConversation, userId]);

  /*格式化会话信息*/
  const conversationItems: ({ key: string, label: string, group: string } & iConversationRecord)[] = useMemo(() => {
    return conversations.map(item => {
      return {
        ...item,
        key: item.id!,
        label: item.title ?? '新建会话',
        group: '今天'
      };
    });
  }, [conversations]);

  /*重新加载会话消息历史数据*/
  const reloadConversation = useCallback(async () => {
    const conversationRecords = await _queryConversationList({ userId });
    setConversations(conversationRecords);
    if (!conversationRecords.length) {
      await createConversation();
    } else {
      setConversationId(conversationRecords[0].id);
    }
  }, [createConversation, userId, _queryConversationList]);

  /*检查当前会话是否已经拥有标题，没有标题则通过AI生成一个标题*/
  const checkConversation = useCallback(async (inputValue: any) => {
    const newestConversations = await getNewestValue(setConversations);
    const newestConversationId = (await getNewestValue(setConversationId))!;
    const conversation = newestConversations.find(i => i.id === newestConversationId)!;

    /*
    * 如果没有标题的话，说明这个会话还没有保存过
    * 如果问题文字长度小于10，则直接使用这个问题作为会话标题
    * 否则使用AI生成一个标题，然后使用这个标题来保存会话信息
    */
    if (!conversation?.title) {
      let title;
      if (inputValue.length <= 10) {
        title = inputValue;
      } else {
        title = await _generateConversationTitle(inputValue);
      }
      const newConversation = await _insertConversation({ conversationId: newestConversationId, title, userId: userId });
      setConversations(prevConversations => prevConversations.map(i => i.id === conversation.id ? newConversation : i));
    }
  }, [_generateConversationTitle, _insertConversation, userId]);

  useStrictMounted(async () => {await reloadConversation();});

  return {
    conversations,
    conversationItems,
    setConversations,
    conversationId,
    setConversationId,
    createConversation,
    removeConversation,
    checkConversation,
  };
}

export type iChatbotConversation = ReturnType<typeof useChatbotConversation>;
