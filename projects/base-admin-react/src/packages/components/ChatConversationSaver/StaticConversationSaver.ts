import {iChatBubbleMessage, iConversationRecord} from "../Chatbot/chatbot.utils";
import {bindSaverMethods, iConversationSaver} from "./iConversationSaver";
import Dayjs from "dayjs";

/*
* 将会话存储在内存中的存储器，刷新页面就会丢失状态
*/
export class StaticConversationSaver implements iConversationSaver {

  constructor(
    /*将会话信息存储到这个变量*/
    public conversationCache: iConversationRecord[] = [],
    /*将会话消息数据存储到这个变量，key为会话的id*/
    public messageCache: Record<string, { messages: iChatBubbleMessage[]; interrupts: Record<string, any> | null }> = {}
  ) {
    bindSaverMethods(this);
  }

  generateConversationTitle(question: string): string | Promise<string> {
    return question;
  }

  insertConversation(param: { userId: string; conversationId: string; title: string }): iConversationRecord | Promise<iConversationRecord> {
    const datetimeString = Dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newConversation = { id: param.conversationId, title: param.title, created_by: param.userId, created_at: datetimeString, updated_at: datetimeString };
    this.conversationCache.unshift(newConversation);
    return newConversation;
  }

  async queryConversationList(param: { userId: string }): Promise<iConversationRecord[]> {
    return this.conversationCache;
  }

  async queryConversationMessages(param: { userId: string; conversationId: string }): Promise<{ messages: iChatBubbleMessage[]; interrupts: Record<string, any> | null }> {
    return this.messageCache[param.conversationId] ?? { messages: [], interrupts: null };
  }

  removeConversation(param: { userId: string; conversationId: string }): void | boolean | Promise<void | boolean> {
    const index = this.conversationCache.findIndex(i => i.id === param.conversationId);
    if (index > -1) {
      this.conversationCache.splice(index, 1);
      delete this.messageCache[param.conversationId];
    }
  }

  async saveConversationMessages(param: { userId: string; conversationId: string; messages: iChatBubbleMessage[]; interrupts: Record<string, any> | null }): Promise<void> {
    this.messageCache[param.conversationId] = { messages: param.messages, interrupts: param.interrupts };
  }
}
