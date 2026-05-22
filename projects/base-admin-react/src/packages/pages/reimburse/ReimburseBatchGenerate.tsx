import {Button, Card, notification, Space} from "antd";
import {RemoteRunnable} from "@langchain/core/runnables/remote";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {uuid} from "@peryl/utils/uuid";
import {showError} from "../../utils/showError";
import {useContext, useMemo, useRef, useState} from "react";
import {TokenContext, UserInfoContext} from "../user/user.utils";
import {iReimburseRecord} from "./reimburse.utils";
import {produce} from "immer";
import {JsonStreamHandler} from "../../utils/createJsonStreamHandler";
import {ReimburseBatchSystemPrompt} from "./ReimburseBatchUtils";
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';
import {iReimburseBatchFormInstance, ReimburseBatchForm} from "./ReimburseBatchForm";
import {getNewestValue} from "../../uses/getNewestValue";
import {http} from "../../utils/http";
import {iProjectRecord} from "../project/project.utils";
import {countOccurrence} from "../../utils/countCoourrences";
import {router} from "../../home/routes";
import {delay} from "@peryl/utils/delay";
import {useLoadingState} from "../../uses/useLoadingState";
import {useStrictMounted} from "../../uses/useStrictMounted";

export const ReimburseBatchGenerate = (
  props: {
    reimburseText: string
  }
) => {

  /*用户token信息，用来请求后端模型服务接口*/
  const token = useContext(TokenContext)!;
  const userInfo = useContext(UserInfoContext)!;

  /*获取batchFormRef的引用，每次切换选中的报销单时，通过 batchFormRef.current.form.getFieldsValue 将最新编辑的值保存到父组件数组数据中*/
  const batchFormRef = useRef<iReimburseBatchFormInstance | null>(null);

  /*识别得到的报销单数据*/
  const [reimburseList, setReimburseList] = useState([] as iReimburseRecord[]);
  // const [reimburseList, setReimburseList] = useState(ReimburseBatchResultDataList as iReimburseRecord[]);

  /*选中的报销单的id*/
  const [selectReimburseId, setSelectReimburseId] = useState(reimburseList[reimburseList.length - 1]?.id as string | null | undefined);

  /*选中的报销单对象，没有就返回最后一条报销单*/
  const selectReimburse: iReimburseRecord | undefined = useMemo(
    () => reimburseList.find(item => item.id === selectReimburseId) ?? reimburseList[reimburseList.length - 1],
    [reimburseList, selectReimburseId]
  );

  /*流式批量识别发票信息*/
  const streamDecodeReimburseRecordList = async (text: string) => {

    /*用来请求后端模型服务的LangChain链对象*/
    const chain = new RemoteRunnable({
      url: pathJoin(env.baseURL, 'qwen-turbo'),
      options: {
        headers: {
          Authorization: `Bearer ${token}`
        },
      },
    });

    /*用来更新reimburseList的流式文本，每次仅保留最后两行*/
    let fullText = '';
    /*用来保存流式调用完整结果的文本变量*/
    let _full_text = '';
    /*开始识别时将显示一个notification，不会自动关闭，因此需要一个notificationKey，待流式识别结束之后通过这个notificationKey来关闭notification*/
    const notificationKey = uuid();
    try {
      notification.info({ message: '正在识别报销单信息...', duration: null, key: notificationKey });

      /*先计算总的报销单数量，优化系统提示词，使得语言模型能够识别出来数量正确的报销单*/
      const countOfReimburse = countOccurrence('text', '报销内容');
      const appendSystemPrompt = `\n用户提供的报销单数量为 ${countOfReimburse}个，请确保返回的报销单数量为 ${countOfReimburse} 个，请确保返回的报销单数量与用户提供的报销单数量一致。`;

      /*开始流式调用*/
      for await (const chunk of await chain.stream(
        { messages: [{ role: 'system', content: ReimburseBatchSystemPrompt + appendSystemPrompt }, { role: 'user', content: text }] }
      )) {
        fullText += chunk;
        _full_text += chunk;

        /*得到流式token之后，拼接到fullText变量中，使用fullText变量来解析返回的点表示法变量，更新到reimburseList中*/
        // eslint-disable-next-line no-loop-func
        setReimburseList(newList => {
          const updateList = produce(newList, draft => {
            fullText = JsonStreamHandler.handleFullText(draft, fullText).list.join('\n');
          });
          // console.log(updateList);
          /*如果没有id，就提供一个id*/
          return updateList.map(item => {return !!item.id ? item : { ...item, id: uuid(), };});
        });
      }
      /*打印流式返回的完整结果，当返回结果不完整时，用来判断是语言模型返回的结果又问题还是流式更新数据对象逻辑出现问题*/
      console.log(_full_text);

      /*流式识别结束之后，将所有的报销单信息中的所属项目信息，根据项目名称查询得到项目信息，保存到报销单对象中的prod_id以及project中*/
      const newestReimburseList = await getNewestValue(setReimburseList);
      console.log(newestReimburseList);
      notification.success({ message: `报销单识别完毕，一共识别 ${newestReimburseList.length} 张报销单信息` });
      const projectNames = newestReimburseList.map(i => (i as any).project).filter(i => typeof i === "string");
      console.log({ projectNames });
      const queryProjectListResponse = await http.post<{ list: iProjectRecord[] }>('/project/list', { all: true, filters: { name: projectNames } });
      console.log(queryProjectListResponse.data);
      const name2project = queryProjectListResponse.data.list.reduce((prev, item) => {
        prev[item.name] = item;
        return prev;
      }, {} as Record<string, undefined | iProjectRecord>);
      setReimburseList(prevReimburseList => {
        return prevReimburseList.map(item => {
          const itemProject = (item as any).project;
          if (typeof itemProject === "string") {
            const project = name2project[itemProject];
            if (!!project) {
              return {
                ...item,
                proj_id: project.id,
                project: project,
              };
            }
          }
          return item;
        });
      });
    } catch (e) {
      showError(e);
    } finally {
      notification.destroy(notificationKey);
    }
  };

  const reload = async () => {
    setReimburseList([]);
    const text = props.reimburseText;
    console.log(text);
    await streamDecodeReimburseRecordList(text);
  };

  /*组件初始化的时候就立即流式解析文本*/
  useStrictMounted(async () => {await reload();});

  const saveSelectReimburseFieldsValue = async () => {
    if (!!selectReimburse) {
      const currentFieldsValue = batchFormRef.current?.form.getFieldsValue();
      setReimburseList(prevList => {
        return prevList
          .map((i) => i.id === selectReimburse.id
            ? { ...selectReimburse, ...currentFieldsValue } :
            i
          );
      });
      await delay(0);
    }
  };

  const changeSelectReimburse = async (
    reimburseRecord: iReimburseRecord,/*要选中的报销单数据*/
  ) => {
    await saveSelectReimburseFieldsValue();
    setSelectReimburseId(reimburseRecord.id);
  };

  const { loading: startSavingReimburseList, isLoading: isSavingReimburseList } = useLoadingState();
  const saveReimburseList = async () => {
    const closeSavingReimburseLIst = startSavingReimburseList();
    try {
      await saveSelectReimburseFieldsValue();
      let newestReimburseList = await getNewestValue(setReimburseList);
      if (!newestReimburseList.length) {
        notification.error({ message: '没有需要保存的报销单！' });
        return;
      }
      /*此时reimburseList中每个报销单的id不是数据库生成的id，这里通过数据库重新为每个报销单生成id*/
      const queryIdListResponse = await http.get<{ data: string[] }>(`/next_id?num=${newestReimburseList.length}`);

      const newIdList = queryIdListResponse.data.data;
      newestReimburseList = newestReimburseList.map((item, index) => {
        const newReimburseId = newIdList[index];
        return {
          ...item,
          user_id: userInfo.id,
          id: newReimburseId,
          travel_list: item.travel_list.map(item => ({ ...item, reimburse_id: newReimburseId })),
          other_list: item.other_list.map(item => ({ ...item, reimburse_id: newReimburseId })),
        };
      });

      /*批量保存差旅费用子项、其他费用子项以及报销单*/
      await Promise.all([
        http.post('/reimburse_travel/batch_insert', newestReimburseList.flatMap(item => item.travel_list)),
        http.post('/reimburse_other/batch_insert', newestReimburseList.flatMap(item => item.other_list)),
        http.post('/reimburse/batch_insert', newestReimburseList),
      ]);
      notification.success({ message: '所有报销单保存成功！' });
      await router.navigate('/pages/reimburse/reimburse-list');
    } catch (e) {
      showError(e);
    } finally {
      closeSavingReimburseLIst();
    }

  };

  return (
    <div style={{ paddingLeft: 'calc(225px + 1em)' }}>
      <div
        className="reimburse-batch-generate-menus"
        style={{
          position: 'fixed',
          top: 'calc(var(--app-header-szie) + 1em)',
          bottom: '1em',
          left: 'calc(var(--app-menu-szie) + 1em)',
          width: '225px',
        }}
      >
        <Card style={{ height: '100%' }} size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            {reimburseList.map(item => (
              <Button
                key={item.id}
                style={{ width: '100%', justifyContent: 'space-between' }}
                type={selectReimburse?.id === item.id ? 'primary' : 'default'}
                onClick={() => changeSelectReimburse(item)}
              >
                <span>{item.title}</span>
                <EllipsisOutlined/>
              </Button>
            ))}
          </Space>
        </Card>
      </div>
      <div className="reimburse-batch-generate-content">
        <Card size="small" style={{ marginBottom: "1em", textAlign: 'right' }}>
          <Space>
            <Button onClick={() => router.navigate(-1)}>返回</Button>
            <Button onClick={reload}>重新识别</Button>
            <Button type="primary" onClick={saveReimburseList} loading={isSavingReimburseList}>保存所有报销单</Button>
          </Space>
        </Card>
        <ReimburseBatchForm
          ref={batchFormRef}
          reimburseRecord={selectReimburse}
        />
      </div>
    </div>
  );
};
