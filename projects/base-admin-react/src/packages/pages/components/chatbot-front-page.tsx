import {Chatbot} from "../../components/Chatbot/Chatbot";


export default () => {
  return (
    <Chatbot
      mode={{
        type: 'StaticFront',
        cacheKey: 'chatbot-front'
      }}
      systemPrompt="你每次回答前都必须带上一个前缀“#StaticFront”，然后才是你回复用户的内容"
    />
  );
}
