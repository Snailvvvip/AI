import React, {ReactElement, useCallback, useContext, useEffect, useState} from "react";
import {RootRenderContext} from "./useRootRender";
import {uuid} from "@peryl/utils/uuid";
import {showError} from "../utils/showError";
import {useStrictMounted} from "./useStrictMounted";
import {delay} from "@peryl/utils/delay";
import {Button, Drawer, Space} from "antd";
import {DrawerProps} from "antd/es/drawer";

export function useDrawer() {
  const { setRootRenderList } = useContext(RootRenderContext)!;

  const openDrawer = useCallback((config: {
    content: ReactElement,
    handleConfirm: () => boolean | void | Promise<boolean | void>,
    handleCancel?: () => void | Promise<void>,
    onInit?: () => void,
    drawerClassName?: string,
    drawerWidth?: number,
    footerLeft?: React.ReactNode,
    drawerProps?: DrawerProps,
    title?: string,
  }) => {

    const renderKey = uuid();

    let closeDrawer = null as null | (() => void);

    const Content = () => {
      const [saving, setSaving] = useState(false);
      const [isDrawerOpen, setDrawerOpen] = useState(false);

      closeDrawer = () => setDrawerOpen(false);
      useEffect(() => {return () => {closeDrawer = null;};}, []);

      let isDone = false;

      const onConfirm = async () => {
        try {
          setSaving(true);
          const flag = await config.handleConfirm();
          if (flag === false) {return;}
          setDrawerOpen(false);
          isDone = true;
        } catch (e) {
          showError(e);
        } finally {
          setSaving(false);
        }
      };

      const onCancel = () => {
        isDone = true;
        config.handleCancel?.();
        setDrawerOpen(false);
      };

      const onClose = () => {
        if (!isDone) {
          onCancel();
        }
        clearEffect();
      };

      useStrictMounted(async () => {
        setDrawerOpen(true);
        /*等DataForm初始化*/
        await delay(78);
        config.onInit?.();
      });

      return (
        <Drawer
          title={config.title ?? '编辑信息'}
          className={config.drawerClassName}
          width={config.drawerWidth ?? 600}
          open={isDrawerOpen}
          afterOpenChange={open => {
            setDrawerOpen(open);
            !open && onClose();
          }}
          footer={<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1em' }}>
              <div>{config.footerLeft}</div>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={onCancel} disabled={saving}>取消</Button>
                <Button type="primary" onClick={onConfirm} loading={saving}>确定</Button>
              </Space>
            </div>
          </>}
          onClose={() => setDrawerOpen(false)}
          {...config.drawerProps}
        >
          {config.content}
        </Drawer>
      );
    };

    setRootRenderList(prevList => ([...prevList, { key: renderKey, render: <Content/> }]));

    const clearEffect = () => {setRootRenderList(prevList => prevList.filter(i => i.key !== renderKey));};

    return { closeDrawer: () => closeDrawer?.() };

  }, [setRootRenderList]);
  return { openDrawer };
}
