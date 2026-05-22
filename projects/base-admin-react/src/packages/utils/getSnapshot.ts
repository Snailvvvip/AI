import html2canvas from "html2canvas";
import {compressCanvas} from "./compressCanvas";
import {base64toFile} from "./base64ToFile";
import {upload} from "./upload";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../env/env";

export async function getSnapshot(el: HTMLElement, compress = true) {
  const canvas = await html2canvas(el, { useCORS: true });

  const base64 = compress ? compressCanvas(canvas, 1920, 1080) : canvas.toDataURL('image/jpeg', 1);

  const file = base64toFile(base64);

  return new Promise<string>((resolve, reject) => {
    upload({
      file,
      action: pathJoin(env.baseURL, 'saveFile'),
      filename: 'file',
      data: { headId: '1', attr1: '2' },
      onSuccess: (resp: any) => {resolve(pathJoin(env.assetsPrefix, resp.result.path));},
      onError: (e) => {reject(e);},
    });
  });
}
