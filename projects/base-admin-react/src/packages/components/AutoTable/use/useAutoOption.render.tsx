import React, {useMemo} from "react";
import {insertSort} from "@peryl/utils/insertSort";
import {iAutoOption, iAutoOptionRenderConfig} from "../auto-table.utils";

export function useAutoOptionRender({ state }: iAutoOption) {

  const { staticRenderList } = state;

  const render = useMemo(() => {
      const renderList = [...staticRenderList.filter(Boolean)] as iAutoOptionRenderConfig[];
      return insertSort(renderList, (a, b) => a.seq > b.seq).map(item => (
        <React.Fragment key={item.key}>
          {item.render}
        </React.Fragment>
      ));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...staticRenderList]
  );

  return render;
}

export type iAutoOptionRender = ReturnType<typeof useAutoOptionRender>

declare module '../auto-table.utils' {
  export interface iAutoOption {
    render: iAutoOptionRender;
  }
}
