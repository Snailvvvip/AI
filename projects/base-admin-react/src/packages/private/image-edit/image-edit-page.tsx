import {Button, Card, Image, Input, message, Space} from "antd";
import {CloudUploadOutlined, PictureOutlined} from "@ant-design/icons";
import {useStableCallback} from "../../uses/useStableCallback";
import $file from "../../utils/file";
import {useState} from "react";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {TokenService} from "../../utils/TokenService";
import {http} from "../../utils/http";
import {showError} from "../../utils/showError";
import {useLoadingState} from "../../uses/useLoadingState";
import {useCacheState} from "../../uses/useCacheState";

export default () => {

  const { loading, isLoading } = useLoadingState();

  const [file, setFile] = useState(null as null | File);

  const [imagePreviewBase64, setImagePreviewBase64] = useState(null as null | string);

  const [generateImagePath, setGenerateImagePath] = useState(null as null | string);

  const [prompt, setPrompt] = useCacheState({
    initialValue: '去掉图片右下角的水印文字',
    cacheKey: 'image-edit-page-prompt-text'
  });

  const upload = useStableCallback(async () => {
    const file = (await $file.chooseImage(false)) as File;
    setImagePreviewBase64(await $file.readAsDataURL(file) as string);
    setFile(file);
  });

  const generate = useStableCallback(async () => {
    const closeLoading = loading();
    const token = await TokenService.getToken();
    const fileSavePath = await new Promise<string>((resolve, reject) => {
      if (!file) {
        message.warning("请先上传图片！");
        return;
      }
      $file.upload({
        file: file,
        action: pathJoin(env.uploadURL, '/save_file'),
        filename: 'file',
        headers: { Authorization: `Bearer ${token}` },
        onSuccess: (responseData: any) => {
          resolve(pathJoin(responseData.result.path));
        },
        onError: (e) => {reject(e);},
      });
    });
    try {
      const resp = await http.post('image-generate', {
        image_url: fileSavePath,
        prompt: prompt,
      });
      console.log('resp.data.path', resp.data.path);
      setGenerateImagePath(pathJoin(env.assetsPrefix, resp.data.path));
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  });

  return (
    <div className="image-edit-page" style={{ padding: '1em' }}>
      <Card title="图片编辑">
        <Space direction="vertical">
          {!!imagePreviewBase64 && <Image src={imagePreviewBase64} style={{ width: '200px', aspectRatio: '16 / 9' }}/>}
          {!!generateImagePath && <Image src={generateImagePath} style={{ width: '200px', aspectRatio: '16 / 9' }}/>}
          <Space.Compact>
            <Button onClick={upload}>
              <CloudUploadOutlined/>
              <span>上传图片</span>
            </Button>
            <Input
              readOnly={isLoading}
              value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '30vw' }}
              onKeyUp={e => e.keyCode === 13 && generate()}
            />
            <Button type="primary" onClick={generate} loading={isLoading}>
              <PictureOutlined/>
              <span>生成</span>
            </Button>
          </Space.Compact>
        </Space>
      </Card>
    </div>
  );
}
