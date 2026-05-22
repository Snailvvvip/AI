import {useCallback, useMemo, useRef, useState} from "react";

/*
* 一个loading状态控制模块
* 调用loading函数会增加一个loading标识，要关闭这个loading标识，则需要调用closeLoading函数
* 当所有loading标识都关闭时，isLoading函数返回false
* 只要有一个loading标识未关闭，isLoading函数返回true
*/
export function useLoadingState() {

  const loadingCount = useRef(0);

  const [ids, setIds] = useState([] as number[]);

  const loading = useCallback(() => {
    const currentCount = loadingCount.current++;
    setIds(prevIds => [...prevIds, currentCount]);
    return () => {
      setIds(prevIds => {
        const index = prevIds.indexOf(currentCount);
        if (index > -1) {
          const ids = [...prevIds];
          ids.splice(index, 1);
          return ids;
        } else {
          return prevIds;
        }
      });
    };
  }, []);

  const isLoading = useMemo(() => ids.length > 0, [ids]);

  return { loading, isLoading };
}
