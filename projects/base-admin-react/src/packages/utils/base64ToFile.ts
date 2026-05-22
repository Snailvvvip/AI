import {createCounter} from "@peryl/utils/createCounter";

export const nextTempFilename = createCounter('temp_file');

/**
 * 将base64字符串转化为file对象
 * @date    2023/6/21 10:24
 */
export function base64toFile(dataurl: string, filename?: string, WindowFile?: typeof window.File) {
  let arr = dataurl.split(',');
  let mime = arr[0].match(/:(.*?);/)![1];
  // suffix是该文件的后缀
  let suffix = mime.split('/')[1];
  // atob 对经过 base-64 编码的字符串进行解码
  let bstr = atob(arr[1]);
  // n 是解码后的长度
  let n = bstr.length;
  // Uint8Array 数组类型表示一个 8 位无符号整型数组 初始值都是 数子0
  let u8arr = new Uint8Array(n);
  // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码。这个返回值是 0 - 65535 之间的整数
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  // new File返回File对象 第一个参数是 ArraryBuffer 或 Bolb 或Arrary 第二个参数是文件名
  // 第三个参数是 要放到文件中的内容的 MIME 类型
  return new (WindowFile || window.File)([u8arr], `${filename || nextTempFilename()}.${suffix}`, {
    type: mime
  });
}
