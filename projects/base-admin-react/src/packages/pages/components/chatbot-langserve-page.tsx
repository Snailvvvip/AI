import {useContext} from "react";
import {UserInfoContext} from "../user/user.utils";
import {Chatbot} from "../../components/Chatbot/Chatbot";


export default () => {

  const pageId = 'chatbot_langserve';
  const userInfo = useContext(UserInfoContext)!;

  return (
    <Chatbot
      mode={{
        type: 'LangServe',
        cacheKey: `${pageId}_${userInfo.id}`,
        langServeUrl: '/doubao'
      }}
      systemPrompt="你每次回答前都必须带上一个前缀“#LangServe”，然后才是你回复用户的内容"
    />
  );
}
