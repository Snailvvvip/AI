import {defer} from "@peryl/utils/defer";
import {createEffects} from "@peryl/utils/createEffects";
import {addElementListener} from "@peryl/utils/addElementListener";
import {addWindowListener} from "@peryl/utils/addWindowListener";
import {delay} from "@peryl/utils/delay";
import {notification} from "antd";

/*单个文件对象数据类型*/
export type FileServiceSingleFile = File & { calcSize: number, data?: any }
/*文件自定义校验函数类型*/
export type FileServiceValidator = (file: FileServiceSingleFile) => boolean | undefined

/*选择文件时的参数类型*/
export type FileServiceChooseFileConfig = {
  multiple?: boolean,                 // 是否多选
  accept?: string,                    // 选择的文件类型， input组件的accept属性值
  validator?: FileServiceValidator,   // 自定义校验函数
  max?: number,                       // 最大文件大小
}

/*文件上传失败时的数据类型*/
export type FileServiceUploadErrorEvent = Error & {
  status: number,
  method: string,
  url: string,
  config: FileServiceUploadConfig,
}

/*文件上传方法参数类型*/
export type FileServiceUploadConfig = {
  action: string,                             // 上传地址
  file: File | File[],                        // 上传的文件
  filename: string,                           // 上传文件接收的文件名
  data?: Record<string, string>,               // 上传的额外数据
  headers?: Record<string, string>,           // 请求头
  withCredentials?: boolean,                  // 是否带cookies凭证
  onProgress?: (percent: number, e: ProgressEvent) => void,
  onSuccess?: (data: string | Record<string, string>) => void,
  onError?: (e: FileServiceUploadErrorEvent | ProgressEvent) => void,
}

/*选择文件类型的内置文件类型别名*/
export const FileServiceDefaultAccept = {
  // image: 'image/gif, image/jpeg, image/png, image/jpg',
  image: 'bmp,jpg,jpeg,png,tif,gif,pcx,tga,exif,fpx,svg,psd,cdr,pcd,dxf,ufo,eps,ai,raw,WMF,webp,avif'.split(',').map(i => `image/${i}`).join(', '),
  excel: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
} as Record<string, string>;

export function createFileService() {

  /*选择文件副作用对象，每次选择文件之后都需要清理掉选择文件时产生的副作用*/
  const { effects: chooseEffects } = createEffects();

  /**
   * 选择文件
   * @author  韦胜健
   * @date    2021/1/1 17:03
   */
  const chooseFile = (config?: FileServiceChooseFileConfig) => {
    config = config || {};
    chooseEffects.clear();
    const inputElement = (() => {
      const input = getInput();
      /*multiple*/
      if (config.multiple) {
        input.setAttribute('multiple', 'multiple');
      } else {
        input.removeAttribute('multiple');
      }
      /*accept*/
      if (!!config.accept) {
        const defaultInputAccept = FileServiceDefaultAccept[config.accept];
        input.setAttribute('accept', defaultInputAccept || config.accept);
      } else {
        input.removeAttribute('accept');
      }
      return input;
    })();
    const dfd = defer<FileServiceSingleFile | FileServiceSingleFile[]>();

    chooseEffects.clear();

    const resolve = (value: FileServiceSingleFile | FileServiceSingleFile[]) => {
      dfd.resolve(value);
      chooseEffects.clear();
    };

    const reject = (reason: string) => {
      dfd.reject(reason);
      chooseEffects.clear();
    };

    const handlers = {
      /*input变化之后说明用户选择了文件*/
      onInputChange: (e: Event) => {
        const targetFiles = (e as any).target.files as FileServiceSingleFile[];
        const files = [];
        for (let i = 0; i < targetFiles.length; i++) {
          const file = targetFiles[i];
          file.calcSize = Number((file.size / (1024 * 1024)).toFixed(2));
          if (!!config!.validator && !config!.validator(file)) {
            reject("File validator failed.");
            return;
          }
          if (!!config!.max && file.calcSize > config!.max) {
            reject("File size unavailable.");
            return notification.error({
              message: `[${file.name}]大小为${file.calcSize}MB，超过最大限制${config!.max}MB`,
              duration: 5
            });
          }
          files.push(file);
        }
        resolve(config!.multiple ? files : files[0]);
      },
      /*
      window focus之后，不论用户选择了文件还是取消选择文件，
      都会触发浏览器窗口的focus方法，
      这里主要用来处理用户取消选择文件时的处理动作
      取消选择文件时调用dfd的reject方法
      */
      onWindowFocus: async () => {
        await delay(500);
        if (!inputElement.value) {dfd.reject('cancel');}
      }
    };

    chooseEffects.push(addElementListener(inputElement, 'change', handlers.onInputChange));
    chooseEffects.push(() => inputElement.value = '');
    chooseEffects.push(addWindowListener('focus', handlers.onWindowFocus));

    inputElement.click();

    return dfd.promise;
  };

  /**
   * 选择图片
   * @author  韦胜健
   * @date    2021/1/1 17:03
   */
  const chooseImage = (multiple?: boolean) => {
    const config: FileServiceChooseFileConfig = { accept: "image", multiple };
    return chooseFile(config);
  };

  /**
   * 读取文件为base64字符串
   * @author  韦胜健
   * @date    2021/1/1 17:04
   */
  const readAsDataURL = (file: File) => {
    const dfd = defer<string | ArrayBuffer | null>();
    let fr = new FileReader();
    fr.onloadend = e => dfd.resolve(e.target!.result);
    fr.onerror = () => dfd.reject();
    fr.readAsDataURL(file);
    return dfd.promise;
  };

  /**
   * 上传文件
   * @author  韦胜健
   * @date    2021/1/1 17:07
   */
  const upload = (uploadConfig: FileServiceUploadConfig) => {
    const xhr = ('XMLHttpRequest' in window ? new XMLHttpRequest() : new (Window as any).ActiveXObject('Microsoft.XMLHTTP')) as XMLHttpRequest;
    xhr.open('post', uploadConfig.action, true);

    if (!!xhr.upload) {
      xhr.upload.addEventListener('progress', (e) => {
        const percent = Number((e.loaded / e.total * 100).toFixed(2));
        !!uploadConfig.onProgress && uploadConfig.onProgress(percent, e);
      });
    }

    if (uploadConfig.withCredentials != null && 'withCredentials' in xhr) {
      xhr.withCredentials = uploadConfig.withCredentials;
    }

    if (!!uploadConfig.headers)
      Object.entries(uploadConfig.headers)
        .forEach(([key, value]) => xhr.setRequestHeader(key, value));

    xhr.onerror = (e) => !!uploadConfig.onError && uploadConfig.onError(e);
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status > 300) {
        !!uploadConfig.onError && uploadConfig.onError(getError(uploadConfig, xhr));
      } else {
        !!uploadConfig.onSuccess && uploadConfig.onSuccess(getResponseBody(xhr));
      }
    };
    const formData = new FormData();
    if (!!uploadConfig.data) Object.entries(uploadConfig.data).forEach(([key, value]) => formData.append(key, value));
    if (Array.isArray(uploadConfig.file)) {
      uploadConfig.file.forEach(f => formData.append(uploadConfig.filename, f));
    } else {
      formData.append(uploadConfig.filename, uploadConfig.file);
    }
    xhr.send(formData);
    return xhr;
  };

  return {
    chooseFile,
    chooseImage,
    readAsDataURL,
    upload,
  };
}

/*获取一个input type为file的input元素，用来选择文件*/
const getInput = (() => {
  let input: HTMLInputElement;
  return () => {
    if (!input) {
      input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.style.display = 'none';
      document.body.appendChild(input);
    }
    return input;
  };
})();

function getError(config: FileServiceUploadConfig, xhr: XMLHttpRequest) {
  let message: string;
  console.log(xhr);
  if (!!xhr.response) {
    message = xhr.response.error || xhr.response;
  } else if (!!xhr.responseText) {
    message = xhr.responseText;
  } else {
    message = `file to post ${config.action} ${xhr.status}`;
  }
  const error = new Error(message) as FileServiceUploadErrorEvent;
  error.status = xhr.status;
  error.method = 'post';
  error.url = config.action;
  error.config = config;
  return error;
}

function getResponseBody(xhr: XMLHttpRequest) {
  let result = xhr.responseText || xhr.response;
  if (!result) return result;
  try {
    return JSON.parse(result);
  } catch (e) {
    return result;
  }
}

export const $file = createFileService();

export default $file;
