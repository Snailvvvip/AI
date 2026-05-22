import React, {Dispatch, ReactElement, SetStateAction, useMemo, useState} from "react";

export function useRootRender() {
  const [rootRenderList, setRootRenderList] = useState<iRenderList>([]);
  const rootRenderContextValue = useMemo(() => ({ setRootRenderList }), [setRootRenderList]);
  return {
    setRootRenderList,
    rootRenderContextValue,
    content: rootRenderList.map(item => (
      <React.Fragment key={item.key}>
        {item.render}
      </React.Fragment>
    ))
  };
}

export const RootRenderContext = React.createContext<{
  setRootRenderList: Dispatch<SetStateAction<iRenderList>>
} | null>(null);

export type iRenderList = ({ key: string, render: ReactElement })[]
