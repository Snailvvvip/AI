import {useLocation} from "react-router";
import {useWatchValueChange} from "../../uses/useWatchValueChange";
import {useContext} from "react";
import {UserInfoContext} from "../../pages/user/user.utils";
import {iChatbotInnerProps, iChatbotProps} from "./chatbot.utils";
import {useChatbotStaticFront} from "../ChatbotFront/useChatbotStaticFront";
import {useChatbotLangServe} from "../ChatbotLangServe/useChatbotLangServe";
import {useChatbotLangGraph} from "../ChatbotLangGraph/useChatbotLangGraph";

export function useChatbotProps(_props: iChatbotProps): iChatbotInnerProps {
  const location = useLocation();

  useWatchValueChange({ value: _props.userId, onChange: () => {throw new Error("不支持动态修改Chatbot组件props.userId");} });
  useWatchValueChange({ value: _props.mode.type, onChange: () => {throw new Error("不支持动态修改Chatbot组件props.mode.type");} });

  /*计算userId默认值*/
  const userId = _props.userId ?? useContext(UserInfoContext)?.id;
  if (!userId) {throw new Error("Chatbot组件必须指定userId");}

  /*计算缓存会话数据的缓存名称*/
  const DEFAULT_CACHE_KEY = (location.pathname || '_root_') + '@' + userId;

  /*根据不同的mode.type，初始化不同的行为*/

  /*解构赋值一个新的props，一会要修改props中的一些默认值*/
  return {
    ..._props,
    userId: userId!,
    behavior: {
      ..._props.mode.type === 'StaticFront' ? useChatbotStaticFront({ cacheKey: _props.mode.cacheKey ?? DEFAULT_CACHE_KEY, aiConfig: _props.mode.aiConfig }) :
        _props.mode.type === 'LangServe' ? useChatbotLangServe({ cacheKey: _props.mode.cacheKey ?? DEFAULT_CACHE_KEY, langServeUrl: _props.mode.langServeUrl ?? 'bailian-qwen-plus' }) :
          useChatbotLangGraph(),
      ..._props.behavior,
    }
  };
}
