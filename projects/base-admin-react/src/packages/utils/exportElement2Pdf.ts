import {notification} from "antd";
import {createSimpleDate} from '@peryl/utils/createSimpleDate';

export async function exportElement2Pdf(el: HTMLElement) {
  try {
    // @ts-ignore
    const dom2pdf = (await import('@peryl/dom-to-pdf')).default;
    await new Promise<void>(resolve => {
      dom2pdf(el, {
        filename: `${createSimpleDate()['YYYY-MM-DD HH:mm:ss']}.pdf`,
        format: 'A4', // 页面格式
        margin: 0,    // 无边距
        overrideWidth: 800,   // 设置宽度（根据需要调整）
      }, () => {
        resolve();
      });
    });
  } catch (e: any) {
    notification.error({ message: e.message || JSON.stringify(e) });
    throw e;
  }
}
