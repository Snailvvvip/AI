import {Image, Space} from 'antd';
import React from "react";
import {assetsPathUtils} from "../../utils/assetsPathUtils";

export const UserMessage = (props: { content: any }): React.ReactElement | null => {
  if (props.content == null) {return null;}
  if (typeof props.content === "string") {
    return <span>{props.content}</span>;
  }
  if (Array.isArray(props.content)) {
    const textContent = props.content.filter(i => i.type === 'text').map(i => i.text).join('\n');
    const imgList = props.content.filter(i => i.type === 'image_url').map(i => i.image_url.url);
    return (
      <div>
        <div style={{ marginBottom: '1em' }}>{textContent}</div>
        <Space>
          {imgList.map((path, index) => (
            <Image src={assetsPathUtils.buildForWeb(path)} width={50} height={50} key={index}/>
          ))}
        </Space>
      </div>
    );
  }
  return <div>无效的消息：{JSON.stringify(props.content)}</div>;
};
