import {iAutoOptionConfig} from "../auto-table.utils";
import {defer} from "@peryl/utils/defer";
import {AutoTable} from "../AutoTable";
import {useAutoOption} from "../use/useAutoOption";
import {useModal} from "../../../uses/useModal";
import {useCallback} from "react";
import {PlainObject} from "@peryl/utils/event";
import {delay} from "@peryl/utils/delay";
import {showError} from "../../../utils/showError";
import {useStrictMounted} from "../../../uses/useStrictMounted";

export function usePickAutoObject() {

  const { openModal } = useModal();

  const pickAutoObject = useCallback(async (param: iPickAutoObjectParam): Promise<PlainObject | PlainObject[]> => {
    const dfd = defer<any>();

    let pickValue: any = undefined;

    const handleConfirm = async () => {
      await delay(78);
      if (!pickValue) {return showError("请选择数据");}
      const flag = await param.handleConfirm?.(pickValue);
      if (flag === false) {return false;}
      dfd.resolve(pickValue);
      closeModal();
    };

    const handleCancel = async () => {
      await param.handleCancel?.();
      // dfd.reject('cancel');
    };

    const Content = () => {

      const option = useAutoOption(() => ({
        selectType: param.multiple ? 'multiple' : undefined,
        showCreateButton: false,
        showEditButton: false,
        showDeleteButton: false,
        showOperateColumn: false,
        ...param.config(),
      }));

      /*每次渲染的时候都将选择的数据保存到外部变量pickValue变量中*/
      pickValue = option.config.selectType === 'multiple' ? option.check.stateCheckedRows : option.select.stateSelectedRow;

      useStrictMounted(async () => {
        /*非多选，并且不可编辑的情况下，双击触发确定动作*/
        if (!option.config.showEditButton && option.config.selectType !== 'multiple') {
          option.hooks.onDblClickRow.on(({ record }) => {
            pickValue = record;
            handleConfirm();
          });
        }
      });

      return (
        <div style={{ width: '50vw' }}>
          <AutoTable option={option}/>
        </div>
      );
    };

    const { closeModal } = openModal({
      modalProps: { title: param.title ?? '请选择' },
      content: (<Content/>),
      handleConfirm: handleConfirm,
      handleCancel: handleCancel,
    });

    return dfd.promise;

  }, [openModal]);

  const pickSingleObject = useCallback((param: Omit<iPickAutoObjectParam, 'multiple'>): Promise<PlainObject> => pickAutoObject({ ...param, multiple: false }), [pickAutoObject]);

  const pickMultipleObject = useCallback((param: Omit<iPickAutoObjectParam, 'multiple'>): Promise<PlainObject[]> => pickAutoObject({ ...param, multiple: true }) as any, [pickAutoObject]);

  return {
    pickSingleObject,
    pickMultipleObject,
  };
}

export interface iPickAutoObjectParam {
  title?: string,
  config: () => iAutoOptionConfig,
  multiple: boolean,
  handleConfirm?: (pickValue: any) => void | boolean | Promise<void | boolean>,
  handleCancel?: () => void | Promise<void>,
}
