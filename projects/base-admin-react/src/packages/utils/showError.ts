import {AxiosError} from "axios";
import {notification} from "antd";

export function showError(e: any) {
  console.error(e);
  if (e === 'cancel') {return;}
  notification.error({ message: getErrorMessage(e) });
}

export function getErrorMessage(e: any) {
  let errorMessage = '';
  if (typeof (e) === 'object' && 'errorFields' in e) {
    errorMessage = e.errorFields.map((i: any) => i.errors.join(',')).join(',');
  } else if (e instanceof AxiosError) {
    errorMessage = e.response?.data.detail
      ?? e.response?.data.message
      ?? e.response?.data.error
      ?? e.message;
  } else {
    errorMessage = e.message || JSON.stringify(e);
  }
  if (errorMessage === 'BodyStreamBuffer was aborted') {
    errorMessage = '请求已经取消';
  }
  return errorMessage;
}

export function showSuccess(msg: string) {
  notification.success({ message: msg });
}
