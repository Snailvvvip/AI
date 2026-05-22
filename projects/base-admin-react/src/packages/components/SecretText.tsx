import {CheckOutlined, CopyOutlined} from "@ant-design/icons";
import {useState} from "react";
import {copyToClipboard} from '@peryl/utils/copyToClipboard';
import {message} from "antd";
import {createEffects} from "@peryl/utils/createEffects";

export function SecretText(props: { text: string }) {
  const { text } = props;
  const [isCopied, setIsCopied] = useState(false);
  const [{ effects }] = useState(() => createEffects());
  if (text == null) {
    return null;
  }
  return (
    <>
      <span>{[text.slice(0, 4), new Array(8).fill("*").join(""), text.slice(-4)]}</span>
      <span style={{ marginLeft: '0.5em', cursor: 'pointer' }} onClick={() => {
        copyToClipboard(text, () => {
          message.success("已经复制");
          setIsCopied(true);
          effects.clear();
          const timer = setTimeout(() => {
            setIsCopied(false);
            effects.clear();
          }, 2000);
          effects.push(() => clearTimeout(timer));
        });
      }}>
        {isCopied ? <CheckOutlined/> : <CopyOutlined/>}
      </span>
    </>
  );
}
