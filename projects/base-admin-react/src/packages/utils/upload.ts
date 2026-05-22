import {http} from "./http";
import {notification} from "antd";

export async function upload(
  config: iUploadConfig
) {

  const { data, filename, file, action } = config;

  const formData = new FormData();

  if (!!data) Object.entries(data).forEach(([key, value]) => formData.append(key, value));

  if (Array.isArray(file)) {
    file.forEach(f => formData.append(filename, f));
  } else {
    formData.append(filename, file);
  }

  try {
    const response = await http.post<any>(action, formData, {
      headers: {
        'Content-type': 'multipart/form-data',
        ...config.headers,
      },
      withCredentials: !!config.withCredentials,
      onUploadProgress: (e: any) => {
        const percent = Number((e.loaded / e.total * 100).toFixed(2));
        config.onProgress?.(percent, e);
      },
    });
    config.onSuccess?.(response.data);
  } catch (e) {
    notification.error({ message: `上传失败,` + String(e).toString(), duration: null });
    config.onError?.(e as any);
    throw e;
  }
}

export interface iUploadConfig {
  action: string,                             // 上传地址
  file: File | File[],                        // 上传的文件
  filename: string,                           // 上传文件接收的文件名
  data?: Record<string, string>,               // 上传的额外数据
  headers?: Record<string, string>,           // 请求头
  withCredentials?: boolean,                  // 是否带cookies凭证
  onProgress?: (percent: number, e: ProgressEvent) => void,
  onSuccess?: (data: string | Record<string, string>) => void,
  onError?: (e: ProgressEvent) => void,
}
