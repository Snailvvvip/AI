import {TokenInfoSaver} from "../utils/TokenService";
import {RootRenderContext, useRootRender} from "../uses/useRootRender";
import {useStrictMounted} from "../uses/useStrictMounted";
import React from "react";

export const LayoutPublic = (props: { children: any }) => {

  useStrictMounted(() => {
    TokenInfoSaver.init('public');
  });

  const { rootRenderContextValue, content } = useRootRender();

  return (
    <RootRenderContext.Provider value={rootRenderContextValue}>
      <div className="app-home" data-collapse={String(true)}>
        <div className="app-home-body" style={{ marginLeft: 0, width: '100%' }}>
          {props.children}
        </div>
      </div>
      {content}
    </RootRenderContext.Provider>
  );
};
