import {useEffect, useState} from "react";
import {PlainObject} from "@peryl/utils/event";
import {deepcopy} from "@peryl/utils/deepcopy";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {iAutoOption} from "../auto-table.utils";
import {getNewestValue} from "../../../uses/getNewestValue";

export function useAutoOptionSelect({ config, hooks }: iAutoOption) {
  /*单选选中行数据*/
  const [stateSelectedRow, setStateSelectedRow] = useState(null as PlainObject | null);

  useStrictMounted(() => {
    /*点击行之后更新选中行*/
    config.selectRowOnClick && hooks.onClickRow.on(({ record }) => {
      // console.log('click row', record);
      setStateSelectedRow(deepcopy(record));
    });

    /*行数据变化之后自动更新选中行*/
    config.selectRowOnLoad && hooks.onAfterLoad.on(async ({ data }) => {
      /*通过setStateSelectedRow找到最新的选中行数据*/
      const newestStateSelectedRow = await getNewestValue(setStateSelectedRow);
      const matchDataRow = (!newestStateSelectedRow ? null : data.find(i => i.id === newestStateSelectedRow.id)) ?? data[0];
      setStateSelectedRow(matchDataRow);
    });
    // }
  });

  useEffect(() => {
    hooks.onSelectRowChange.exec({ record: stateSelectedRow });
  }, [stateSelectedRow, hooks]);

  return {
    stateSelectedRow,
    setStateSelectedRow,
  };
}

export type iAutoOptionSelect = ReturnType<typeof useAutoOptionSelect>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    select: iAutoOptionSelect;
  }
}
