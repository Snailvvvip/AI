import {useEffect, useRef, useState} from "react";
import {useStrictMounted} from "../uses/useStrictMounted";

export const ChatLoadingMsg = () => {

  const [text, setText] = useState('.');
  const timerRef = useRef(null as any);

  useStrictMounted(async () => {
    timerRef.current = setInterval(() => {
      setText(prevText => {
        if (prevText.length <= 5) {
          return prevText + '.';
        } else {
          return '.';
        }
      });
    }, 1000);
  });

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return <span>{text}</span>;
};
