import {Button, Modal} from "antd";

export function modalConfirm(confirmMessage: string) {

  return new Promise<boolean>(resolve => {

    let done = false;

    const confirm = () => {
      done = true;
      resolve(true);
      destroy();
    };
    const cancel = () => {
      done = true;
      resolve(false);
      destroy();
    };

    const { destroy } = Modal.confirm({
      title: '确认提示',
      closable: true,
      content: <div>{confirmMessage}</div>,
      footer: <>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={cancel}>取消</Button>
          <Button style={{ marginLeft: '1em' }} type="primary" onClick={confirm}>确定</Button>
        </div>
      </>,
      afterClose: () => {
        if (!done) {
          done = true;
          cancel();
        }
      },
    });

  });

}
