import React, {useCallback, useMemo, useState} from "react";
import type {MenuProps} from "antd/es/menu";
import EditOutlined from "@ant-design/icons/EditOutlined";
import {Button, Dropdown, Space, Tooltip} from "antd";
import FileSearchOutlined from "@ant-design/icons/FileSearchOutlined";
import {pathJoin} from "@peryl/utils/pathJoin";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {getErrorMessage, showError} from "../../../utils/showError";
import {delay} from "@peryl/utils/delay";
import type {ItemType} from "antd/es/menu/interface";
import DownOutlined from "@ant-design/icons/DownOutlined";
import {getNewestValue} from "../../../uses/getNewestValue";
import {createEffects} from "@peryl/utils/createEffects";
import {getQueryDescription, mergeQueryParam} from "../../Filter/filter.query";
import {iAutoOption} from "../auto-table.utils";
import {getChatAssistantPrompt, getChatBatchCreatePrompt} from "../auto-table.prompts";

export function useAutoOptionToolbar({ state, methods, config, select, copilot, filterBar, filterForm, tips, hooks, columns }: iAutoOption) {

  const { setShowFilterForm } = filterForm;

  const { setTipList } = tips;

  const { isEditing, staticRenderList, setTempColumns, setStateSortData, setStateData } = state;

  const { filterBarContent } = filterBar;

  const { createRecord: _createRecord, cancel, save, formEditRecord, formCreateRecord, reload } = methods;

  const { openChatBox } = copilot;

  /*无参调用 _createRecord*/
  const createRecord = useCallback(() => _createRecord(), [_createRecord]);

  /*每次使用chat assistant来进行筛选排序时，先清理掉上一次的查询条件*/
  const [{ effects: chatQueryEffects }] = useState(() => createEffects());

  /*智能查询、排序、字段配置*/
  const chatWithAssistant = useCallback(async () => {
    const { closeChatbox } = openChatBox({
      systemPrompt: getChatAssistantPrompt(config.columns),
      mode: { type: 'LangServe', cacheKey: false },
      fastSenders: null,
      fastQuestions: [
        "查询编号为0010-1101-1011-1100，并且创建时间大于2025年10月10日的数据",
        "根据创建时间降序排序，然后根据更新时间升序排序",
        "将编号字段左固定，并且宽度调整为100"
      ],
      handleAiMessage: async (message, question) => {
        console.log(message);
        if (message.indexOf('暂不支持回答其他问题') > -1) {
          return;
        }
        try {
          const parseObject = JSON.parse(message);
          if ("columns" in parseObject) {
            console.log('set columns');
            setTempColumns(parseObject['columns']);
            closeChatbox();
          } else if ("orders" in parseObject) {
            console.log('set orders');
            setStateSortData(parseObject['orders']);
            reload();
            closeChatbox();
          } else if ("queries" in parseObject) {
            chatQueryEffects.clear();
            console.log('set queries');
            const tipText = await getQueryDescription(parseObject, config.columns);
            setTipList(prevList => [...prevList, {
              text: tipText,
              clear: chatQueryEffects.clear,
            }]);
            chatQueryEffects.push(() => {setTipList(prevList => prevList.filter(i => i.clear !== chatQueryEffects.clear));});
            chatQueryEffects.push(
              hooks.onQueryParam.on(({ queryParam }) => {
                return { queryParam: mergeQueryParam(queryParam, parseObject) };
              })
            );
            reload();
            closeChatbox();
          }
        } catch (e) {
          showError(e);
        }
      },
    });
  }, [openChatBox, config.columns, setTempColumns, setStateSortData, reload, hooks, setTipList, chatQueryEffects]);

  const { setStateSelectedRow } = select;

  const moreButtonMenus = useMemo((): MenuProps => {
    return {
      items: [
        config.showCreateButton ? {
          key: 'FORM_CREATE',
          label: '表单新建',
          icon: <EditOutlined/>,
          onClick: async () => {
            await formCreateRecord();
          }
        } : null,
        config.showEditButton ? {
          key: 'FORM_EDIT',
          label: '表单编辑',
          icon: <EditOutlined/>,
          onClick: async () => {
            const stateSelectedRow = await getNewestValue(setStateSelectedRow);
            if (!stateSelectedRow) {return showError("请选中要编辑的数据");}
            const newestStateData = await getNewestValue(setStateData);
            /*得用表格中的数据，不然保存完之后找不到showIndex*/
            const stateTargetRow = newestStateData.find(i => i.id === stateSelectedRow.id);
            if (!stateTargetRow) {
              showError("渲染异常，请联系管理员！");
              return;
            }
            await formEditRecord({ record: stateTargetRow, isCreateRecord: false });
          }
        } : null,
        config.showCreateButton ? {
          key: 'AI_CREATE',
          label: '智能新建',
          icon: <EditOutlined/>,
          onClick: async () => {
            const { closeChatbox } = openChatBox({
              /*系统提示词*/
              systemPrompt: getChatBatchCreatePrompt(columns.sourceOtherColumns),
              mode: { type: 'LangServe', cacheKey: false },
              handleAiMessage: async (message: string) => {
                try {
                  const parseData = JSON.parse(message);
                  console.log('提取结果', parseData);
                  await _createRecord(parseData);
                  await delay(500);
                  closeChatbox();
                } catch (e) {
                  console.error(e);
                  showError("解析结果JSON格式不正确：" + getErrorMessage(e));
                }
              },
              fastQuestions: null,
              fastSenders: null,
            });
          }
        } : null,
        // {
        //   key: 'SORT',
        //   label: '高级排序',
        //   icon: <EditOutlined/>,
        //   onClick: () => {
        //     // todo
        //   }
        // },
        // {
        //   key: 'FILTER',
        //   label: '高级筛选',
        //   icon: <EditOutlined/>,
        //   onClick: () => {
        //     // todo
        //   }
        // }
      ].filter(Boolean)
    };

  }, [formEditRecord, setStateSelectedRow, config, formCreateRecord, _createRecord, openChatBox, columns.sourceOtherColumns, setStateData]);

  const toolbarRender = useMemo(() => {
    return (
      <div className="auto-table-toolbar">
        <div className="auto-table-toolbar-searchbar">
          <Space>
            {filterBarContent}
            <Tooltip title="表单查询">
              <Button style={{ padding: 0, aspectRatio: 1 }} onClick={() => setShowFilterForm(prev => !prev)}>
                <FileSearchOutlined/>
              </Button>
            </Tooltip>
            <Tooltip title="智能查询、排序、字段配置">
              <Button style={{ padding: 0, overflow: 'hidden', display: 'flex' }} onClick={chatWithAssistant}>
                <img src={pathJoin(__webpack_public_path__, '/images/ai_button.jpeg')} alt="ai button" style={{ height: '100%', aspectRatio: '1 / 1' }}/>
              </Button>
            </Tooltip>
          </Space>
        </div>
        <div className="auto-table-toolbar-buttonbar">
          <Space>
            {isEditing ? (
              <>
                {config.showCreateButton && (
                  <Button onClick={createRecord}>
                    <PlusOutlined/>
                    <span>继续新建</span>
                  </Button>
                )}
                <Button onClick={cancel}>
                  <span>取消</span>
                </Button>
                <Button type="primary" onClick={save}>
                  <span>保存</span>
                </Button>
              </>
            ) : (
              <>
                {config.showCreateButton && (
                  <Button type="primary" onClick={() => (config.handleCreate ?? createRecord)()}>
                    <PlusOutlined/>
                    <span>{config.createButtonText ?? '新建'}</span>
                  </Button>
                )}
                {config.buttons?.map((btn, btnIndex) => <React.Fragment key={btn.label ?? btnIndex}>{!!btn.render ? btn.render() : <Button onClick={btn.onClick} key={btn.label}>{btn.label}</Button>}</React.Fragment>)}
                <MoreButton menus={moreButtonMenus}/>
              </>
            )}
          </Space>
        </div>
      </div>
    );
  }, [createRecord, isEditing, cancel, save, config, moreButtonMenus, filterBarContent, setShowFilterForm, chatWithAssistant]);

  const toolbarRenderConfig = useMemo(() => ({ key: 'toolbar', seq: 1, render: toolbarRender }), [toolbarRender]);

  staticRenderList.push(toolbarRenderConfig);

  return {
    moreButtonMenus,
    toolbarRender,
    toolbarRenderConfig,
  };
}

const MoreButton = (props: { menus: MenuProps }) => {

  const [lastItem, setLastItem] = useState(null as null | ItemType);

  const menus = useMemo(() => {
    return {
      ...props.menus,
      items: props.menus.items?.map(item => {
        if (!item) {return item;}
        return {
          ...item,
          onClick: () => {
            setLastItem(item);
            (item as any).onClick?.();
          }
        };
      })
    };
  }, [props.menus]);

  if (!menus.items?.length) {return null;}

  return (
    <Dropdown menu={menus} placement="bottomRight">
      <Space.Compact>
        <Button onClick={(lastItem as any)?.onClick}>{(lastItem as any)?.label ?? '更多'}</Button>
        <Button style={{ padding: '0', aspectRatio: 1 }}>
          <DownOutlined/>
        </Button>
      </Space.Compact>
    </Dropdown>
  );
};

export type iAutoOptionToolbar = ReturnType<typeof useAutoOptionToolbar>

declare module '../auto-table.utils' {
  export interface iAutoOption {
    toolbar: iAutoOptionToolbar;
  }
}
