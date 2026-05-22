import {Chatbot} from "../../components/Chatbot/Chatbot";


export default () => {
  return (
    <Chatbot
      userId="chatbot-page"
      mode={{ type: 'LangGraph' }}
    />
  );
}
