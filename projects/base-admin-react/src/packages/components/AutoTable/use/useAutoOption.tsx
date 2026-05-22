import {useMemo, useState} from "react";
import {iAutoOption, iAutoOptionConfig, iAutoOptionInnerConfig, iAutoOptionRunningConfig} from "../auto-table.utils";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {useAutoOptionState} from "./useAutoOption.state";
import {useAutoOptionHooks} from "./useAutoOption.hooks";
import {useAutoOptionMethods} from "./useAutoOption.methods";
import {useAutoOptionSelect} from "./useAutoOption.select";
import {useAutoOptionCheck} from "./useAutoOption.check";
import {useAutoOptionOperate} from "./useAutoOption.operate";
import {useAutoOptionColumns} from "./useAutoOption.columns";
import {useAutoOptionToolbar} from "./useAutoOption.toolbar";
import {useAutoOptionTable} from "./useAutoOption.table";
import {useAutoOptionRender} from "./useAutoOption.render";
import {useAutoOptionFilterBar} from "./useAutoOption.filterBar";
import {useAutoOptionFilterForm} from "./useAutoOption.filterForm";
import {useAutoOptionTips} from "./useAutoOption.tips";
import {getNewestValue} from "../../../uses/getNewestValue";
import {useCopilotDrawer} from "../../../uses/useCopilotDrawer";
import {useAutoFormDrawer} from "../useAutoFormDrawer";

export function useAutoOption(configGetter: () => iAutoOptionConfig) {

  /*配置信息*/
  const [config, setConfig] = useState((): iAutoOptionRunningConfig => {
    const requireConfig: iAutoOptionInnerConfig = {
      pageSize: 10,
      loadOnStart: true,
      selectRowOnClick: true,
      selectRowOnLoad: true,
      checkRowOnClick: true,
      showEditButton: true,
      showDeleteButton: true,
      showCreateButton: true,
      showCopyButton: true,
      showOperateColumn: true,
      editRowOnDblClick: true,
    };
    return {
      ...requireConfig,
      ...configGetter(),
    };
  });

  const copilot = useCopilotDrawer();
  const drawer = useAutoFormDrawer();

  const option: iAutoOption = { config, setConfig, copilot, drawer } as any;

  option.state = useAutoOptionState(option);
  option.hooks = useAutoOptionHooks(option);
  option.methods = useAutoOptionMethods(option);
  option.tips = useAutoOptionTips(option);
  option.select = useAutoOptionSelect(option);
  option.check = useAutoOptionCheck(option);
  option.operate = useAutoOptionOperate(option);
  option.columns = useAutoOptionColumns(option);
  option.filterBar = useAutoOptionFilterBar(option);
  option.filterForm = useAutoOptionFilterForm(option);
  option.toolbar = useAutoOptionToolbar(option);
  option.table = useAutoOptionTable(option);
  option.render = useAutoOptionRender(option);

  useStrictMounted(async () => {
    if (config.parentKeyMap && !!config.parentOption) {
      /*父子表联动的情况下，等父表选中行变化再查询数据*/
      config.parentOption.hooks.onSelectRowChange.on(() => {
        option.methods.reload();
      });
      /*已经有选中数据的话说明父表已经初始化好数据了，子表立即查询*/
      const parentSelectRow = await getNewestValue(config.parentOption.select.setStateSelectedRow);
      if (!!parentSelectRow) {config.loadOnStart && await option.methods.reload();}
    } else {
      /*loadOnStart为true时，立即加载数据*/
      config.loadOnStart && await option.methods.reload();
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _option = useMemo(() => option, [...Object.values(option)]);

  return _option;
}
