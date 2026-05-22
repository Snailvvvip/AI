import {iAutoOption, iAutoOptionRenderConfig} from "../auto-table.utils";
import {useMemo, useState} from "react";
import {iFilterTip} from "../../Filter/filter.utils";
import CloseOutlined from "@ant-design/icons/CloseOutlined";

export function useAutoOptionTips(option: iAutoOption) {

  const { state: { staticRenderList, stateSortData, setStateSortData }, methods: { reload }, config } = option;

  const [_tipList, setTipList] = useState([] as iFilterTip[]);

  const tipList = useMemo(() => {
    const ret = [..._tipList];
    if (stateSortData.length > 1) {
      ret.push({
        text: '按照 ' + stateSortData.map(i => `${config.columns.find(col => col.dataIndex === i.field)?.originTitle ?? i.field} ${i.desc ? '降序' : '升序'}`).join(','),
        clear: () => setStateSortData([{ field: 'createdAt', desc: true }])
      });
    }
    return ret;
  }, [_tipList, stateSortData, setStateSortData, config.columns]);

  const tipsRenderConfig = useMemo((): iAutoOptionRenderConfig => {
    return {
      seq: 1.5,
      key: 'tips',
      render: (
        <div className="auto-tip-list">
          {tipList.map((tip) => (
            <div key={tip.text} className="auto-tip-item" onClick={() => {
              tip.clear();
              reload();
            }}>
              <span>{tip.text}</span>
              <CloseOutlined/>
            </div>
          ))}
        </div>
      )
    };
  }, [tipList, reload]);

  staticRenderList.push(!!tipList.length ? tipsRenderConfig : null);

  return {
    tipList,
    setTipList,
  };
}

export type iAutoOptionTips = ReturnType<typeof useAutoOptionTips>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    tips: iAutoOptionTips;
  }
}
