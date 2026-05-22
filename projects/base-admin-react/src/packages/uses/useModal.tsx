import React, {useCallback, useContext, useEffect, useState} from "react";
import {RootRenderContext} from "./useRootRender";
import {uuid} from "@peryl/utils/uuid";
import {showError} from "../utils/showError";
import {useStrictMounted} from "./useStrictMounted";
import {delay} from "@peryl/utils/delay";
import {Button, Modal, ModalProps, Space} from "antd";

export function useModal() {
  const { setRootRenderList } = useContext(RootRenderContext)!;

  const openModal = useCallback((config: {
    content: React.ReactNode,
    handleConfirm: () => boolean | void | Promise<boolean | void>,
    handleCancel?: () => void | Promise<void>,
    onInit?: () => void,
    modalClassName?: string,
    modalWidth?: number,
    footerLeft?: React.ReactNode,
    modalProps?: ModalProps,
  }) => {

    const renderKey = uuid();

    let closeModal = null as null | (() => void);

    const Content = () => {
      const [saving, setSaving] = useState(false);
      const [isModalOpen, setModalOpen] = useState(false);

      closeModal = () => setModalOpen(false);
      useEffect(() => {return () => {closeModal = null;};}, []);

      let isDone = false;

      const onConfirm = async () => {
        try {
          setSaving(true);
          const flag = await config.handleConfirm();
          if (flag === false) {return;}
          setModalOpen(false);
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
        setModalOpen(false);
      };

      const onClose = () => {
        if (!isDone) {
          onCancel();
        }
        clearEffect();
      };

      useStrictMounted(async () => {
        setModalOpen(true);
        /*等内容初始化*/
        await delay(78);
        config.onInit?.();
      });

      return (
        <Modal
          wrapClassName={config.modalClassName}
          width="fit-content"
          open={isModalOpen}
          onCancel={onCancel}
          afterOpenChange={open => {
            setModalOpen(open);
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
          afterClose={() => setModalOpen(false)}
          {...config.modalProps}
        >
          {config.content}
        </Modal>
      );
    };

    setRootRenderList(prevList => ([...prevList, { key: renderKey, render: <Content/> }]));

    const clearEffect = () => {setRootRenderList(prevList => prevList.filter(i => i.key !== renderKey));};

    return { closeModal: () => closeModal?.() };

  }, [setRootRenderList]);

  return { openModal };
}
