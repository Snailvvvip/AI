import {iChatBubbleMessage, iConversationRecord} from "../Chatbot/chatbot.utils";
import {bindSaverMethods, iConversationSaver} from "./iConversationSaver";
import Dayjs from "dayjs";

/*
* 使用localStorage作为存储的会话存储器
*/
export class StorageConversationSaver implements iConversationSaver {

  constructor(public conversationCacheKey: string) {
    bindSaverMethods(this);
  }

  generateConversationTitle(question: string): string | Promise<string> {
    return question;
  }

  insertConversation(param: { userId: string; conversationId: string; title: string }): iConversationRecord | Promise<iConversationRecord> {
    const jsonString = localStorage.getItem(this.conversationCacheKey);
    const conversationList: iConversationRecord[] = !jsonString ? [] : JSON.parse(jsonString);
    const datetimeString = Dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newConversation = { id: param.conversationId, title: param.title, created_by: param.userId, created_at: datetimeString, updated_at: datetimeString };
    conversationList.unshift(newConversation);
    localStorage.setItem(this.conversationCacheKey, JSON.stringify(conversationList));
    return newConversation;
  }

  queryConversationList(param: { userId: string }): Promise<iConversationRecord[]> {
    const jsonString = localStorage.getItem(this.conversationCacheKey);
    return !jsonString ? [] : JSON.parse(jsonString);
  }

  queryConversationMessages(param: { userId: string; conversationId: string }): Promise<{ messages: iChatBubbleMessage[]; interrupts: Record<string, any> }> {
    const messagesCacheKey = `${this.conversationCacheKey}_messages_${param.conversationId}`;
    const jsonString = localStorage.getItem(messagesCacheKey);
    return !jsonString ? { messages: [], interrupts: null } : JSON.parse(jsonString);
  }

  async removeConversation(param: { userId: string; conversationId: string }): Promise<void | boolean> {
    const conversationList: iConversationRecord[] = await this.queryConversationList({ userId: param.userId });
    localStorage.setItem(this.conversationCacheKey, JSON.stringify(conversationList.filter(i => i.id !== param.conversationId)));

    const messagesCacheKey = `${this.conversationCacheKey}_messages_${param.conversationId}`;
    localStorage.removeItem(messagesCacheKey);
  }

  async saveConversationMessages(param: { userId: string; conversationId: string; messages: iChatBubbleMessage[]; interrupts: Record<string, any> | null }): Promise<void> {
    const messagesCacheKey = `${this.conversationCacheKey}_messages_${param.conversationId}`;
    localStorage.setItem(messagesCacheKey, JSON.stringify({ messages: param.messages, interrupts: param.interrupts }));
  }
}
