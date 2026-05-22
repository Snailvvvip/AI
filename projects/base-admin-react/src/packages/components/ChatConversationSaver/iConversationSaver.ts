import {iChatBubbleMessage, iConversationRecord} from "../Chatbot/chatbot.utils";

export interface iConversationSaver {
  /*查询所有会话记录*/
  queryConversationList: (param: { userId: string }) => Promise<iConversationRecord[]>,
  /*删除会话*/
  removeConversation: (param: { userId: string, conversationId: string }) => void | boolean | Promise<void | boolean>,
  /*新建会话*/
  insertConversation: (param: { userId: string, conversationId: string, title: string }) => iConversationRecord | Promise<iConversationRecord>,
  /*查询会话消息历史*/
  queryConversationMessages: (param: { userId: string, conversationId: string }) => Promise<{ messages: iChatBubbleMessage[], interrupts: Record<string, any> | null }>,
  /*保存会话消息*/
  saveConversationMessages: (param: { userId: string, conversationId: string, messages: iChatBubbleMessage[], interrupts: Record<string, any> | null }) => Promise<void>,
  /*生成会话标题*/
  generateConversationTitle: (question: string) => string | Promise<string>,
}

export function bindSaverMethods(instance: iConversationSaver) {
  instance.generateConversationTitle = instance.generateConversationTitle.bind(instance);
  instance.insertConversation = instance.insertConversation.bind(instance);
  instance.queryConversationList = instance.queryConversationList.bind(instance);
  instance.queryConversationMessages = instance.queryConversationMessages.bind(instance);
  instance.removeConversation = instance.removeConversation.bind(instance);
  instance.saveConversationMessages = instance.saveConversationMessages.bind(instance);
  instance.queryConversationMessages = instance.queryConversationMessages.bind(instance);
  instance.generateConversationTitle = instance.generateConversationTitle.bind(instance);
}
