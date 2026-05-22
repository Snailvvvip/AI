import {Button, Card, notification, Space} from "antd";
import {useCopilotDrawer} from "../../uses/useCopilotDrawer";
import {useCallback} from "react";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";

const Demo1 = () => {
  const { openChatBox } = useCopilotDrawer();

  const open = useCallback(() => {
    const { closeChatbox } = openChatBox({
      systemPrompt: "你每次回答前都必须带上一个前缀“#StaticFront”，然后才是你回复用户的内容",
      mode: {
        type: 'StaticFront',
        cacheKey: false,
      },
      handleAiMessage: (message) => {
        notification.info({ message: `得到响应内容："${message}"，点击这条消息关闭对话框`, onClick: closeChatbox });
      },
    });
  }, [openChatBox]);

  return (
    <Card title="基本用法：设置提示词以及获取LLM回复消息">
      <Space direction="vertical">
        <Button type="primary" onClick={open}>打开</Button>
      </Space>
    </Card>
  );
};


const Demo2 = () => {
  const { openChatBox } = useCopilotDrawer();

  const open = useCallback(() => {
    openChatBox({
      systemPrompt: "你每次回答前都必须带上一个前缀“#LangServe:qwen-turbo”，然后才是你回复用户的内容",
      mode: {
        type: 'LangServe',
        cacheKey: false,
        langServeUrl: pathJoin(env.baseURL, 'bailian-qwen-plus')
      }
    });
  }, [openChatBox]);

  return (
    <Card title="基本用法：自定义langServeUrl">
      <Space direction="vertical">
        <Button type="primary" onClick={open}>打开</Button>
      </Space>
    </Card>
  );
};

const Demo3 = () => {
  const { openChatBox } = useCopilotDrawer();

  const open = useCallback(() => {
    openChatBox({
      systemPrompt: "你每次回答前都必须带上一个前缀“#StaticFront:THUDM/GLM-Z1-9B-0414”，然后才是你回复用户的内容",
      mode: {
        type: 'StaticFront',
        cacheKey: false,
        aiConfig: {
          base_url: 'https://api.siliconflow.cn/v1/chat/completions',
          api_key: 'Bearer sk-cfdkoqcakgzptslbhdndlmmoqxagluwkojaktfnrvprmqkkl',
          model: 'THUDM/GLM-Z1-9B-0414',
        }
      }
    });
  }, [openChatBox]);

  return (
    <Card title="基本用法：自定义url，key以及model">
      <Space direction="vertical">
        <Button type="primary" onClick={open}>打开</Button>
      </Space>
    </Card>
  );
};


export default () => {
  return (
    <div style={{ padding: '1em' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Demo1/>
        <Demo2/>
        <Demo3/>
      </Space>
    </div>
  );
}
