import {useCallback, useRef} from "react";
import {getErrorMessage, showError} from "../../../utils/showError";
import {AxiosRequestConfig} from "axios";
import {getRowsMapper, iAutoOption, omit} from "../auto-table.utils";
import {http} from "../../../utils/http";
import {PlainObject} from "@peryl/utils/event";
import {next_id} from "../../../utils/next_id";
import {uuid} from "@peryl/utils/uuid";
import {getNewestValue} from "../../../uses/getNewestValue";
import {toArray} from '@peryl/utils/toArray';
import {message} from "antd";
import {useStrictMounted} from "../../../uses/useStrictMounted";
import {iFilterHandlerQueryMeta, mergeQueryParam} from "../../Filter/filter.query";
import {deepcopy} from "@peryl/utils/deepcopy";

export function useAutoOptionMethods({ config, state, hooks, drawer, setConfig }: iAutoOption) {

  const {
    statePagination,
    setStatePagination,

    setStateSortData,

    // stateLoading,
    setStateLoading,

    stateData,
    setStateData,

    // _stateEditIdMapper,
    setStateEditIdMapper,

    stateCreateIdMapper,
    setStateCreateIdMapper,

    stateEditIdMapper,
    isEditing,
    formInstanceManager,
    // autoTableRowContextValue,
    getShowIndex,
    getIndex,
  } = state;

  const { editRecordWithDrawer } = drawer;

  /*加载某页数据*/
  const load = useCallback(async (page: number = statePagination.current, pageSize: number = statePagination.pageSize) => {

    if (isEditing) {
      showError("请先保存正在编辑的行数据");
      return;
    }

    setStateLoading(true);

    try {
      const stateSortData = await getNewestValue(setStateSortData);
      const requestConfig: AxiosRequestConfig = {
        url: `/general/${config.module}/list`,
        method: 'post',
        data: {
          ...typeof config.queryParam === "function" ? await config.queryParam() : config.queryParam,
          page: page - 1,
          size: pageSize,
          withCount: true,
          orders: stateSortData,
        }
      };

      /*合并查询参数*/
      let queryParam = (await hooks.onQueryParam.exec({ queryParam: requestConfig.data })).queryParam;

      /*父子表查询参数*/
      if (!!config.parentOption && config.parentKeyMap) {
        const parentSelectRow = await getNewestValue(config.parentOption.select.setStateSelectedRow);
        if (!!parentSelectRow) {
          /*父表的筛选条件*/
          let queries = Object.entries(config.parentKeyMap).reduce((prev, [childKey, parentKey]) => {
            prev.push({ field: childKey, operator: '=', value: parentSelectRow[parentKey] });
            return prev;
          }, [] as iFilterHandlerQueryMeta[]);
          queryParam = mergeQueryParam(queryParam, { queries });
        } else {
          setStateData([]);
          return;
        }
      }

      /*格式化查询参数*/
      const { queries, expression, ...leftQueryParam } = queryParam;

      requestConfig.data = { ...requestConfig.data, ...leftQueryParam };
      if (!!queries?.length) {
        requestConfig.data.filters = queries;
        if (!!expression) {
          requestConfig.data.filterExpression = expression;
        }
      }

      await hooks.onBeforeLoad.exec({ requestConfig });

      const resp = await http.request<{ list: PlainObject[], has_next: boolean, total: number }>(requestConfig);

      setStateData(resp.data.list);
      setStatePagination({
        current: page,
        pageSize,
        total: resp.data.total ?? (resp.data.has_next ? page * pageSize + 1 : ((page - 1) * pageSize + resp.data.list.length)),
      });

      await hooks.onAfterLoad.exec({ data: resp.data.list });

    } catch (e) {
      showError(e);
    } finally {
      setStateLoading(false);
    }

  }, [hooks, config, statePagination, isEditing, setStateData, setStateLoading, setStatePagination, setStateSortData]);

  /*重新加载第一页数据*/
  const reload = useCallback(async () => load(1), [load]);

  /*编辑行数据*/
  const editRecord = useCallback(async (record: PlainObject | PlainObject[]) => {
    if (!Array.isArray(record)) {
      setStateEditIdMapper(prevMapper => ({ ...prevMapper, [record.id]: true }),);
    } else {
      const newIdMapper = getRowsMapper(record);
      setStateEditIdMapper(prevMapper => ({ ...prevMapper, ...newIdMapper }));
    }
  }, [setStateEditIdMapper]);

  /*获取默认的新行数据*/
  const getDefaultNewRow = useCallback(async (initialValues?: PlainObject) => {
    /*默认的新行数据*/
    const initialNewRecord: Record<string, any> = deepcopy(initialValues ?? (!config.defaultNewRow ? {} : (typeof config.defaultNewRow === "function" ? (await config.defaultNewRow()) : config.defaultNewRow)));

    if (!initialNewRecord.id) {
      if (config.defaultNewRowId) {
        initialNewRecord.id = await next_id();
      } else {
        initialNewRecord.id = `!_${uuid()}`;
      }
    }

    /*父子表映射字段默认值*/
    if (!!config.parentKeyMap && !!config.parentOption) {
      const parentSelectRow = await getNewestValue(config.parentOption.select.setStateSelectedRow);
      if (!parentSelectRow) {
        const err = '父表缺少选中行数据！';
        showError(err);
        throw new Error(err);
      }
      const defaultNewRecord = Object.entries(config.parentKeyMap).reduce((prev, [childKey, parentKey]) => {
        prev[childKey] = parentSelectRow![parentKey];
        return prev;
      }, initialNewRecord);
      Object.assign(initialNewRecord, defaultNewRecord);
    }

    return initialNewRecord;
  }, [config]);

  /*新建一条数据*/
  const createRecord = useCallback(async (initialValues?: PlainObject | PlainObject[]) => {

    const initialRecords = await Promise.all(toArray(initialValues).map(item => getDefaultNewRow(item)));

    setStateData(prevList => [...initialRecords, ...prevList]);
    setStateCreateIdMapper(prevMapper => ({ ...prevMapper, ...getRowsMapper(initialRecords) }));
    /*不需要标记editIdMapper，因为stateEditIdMapper是一个计算属性，已经合并了_stateEditIdMapper以及stateCreateIdMapper*/
    // setStateEditIdMapper(prevMapper => ({ ...prevMapper, ...getRowsMapper(initialRecords) }));

  }, [setStateCreateIdMapper, setStateData, getDefaultNewRow]);

  /*复制一条数据*/
  const copyRecord = useCallback(async (record: PlainObject) => {
    const { id, createdAt, createdBy, updatedAt, updatedBy, ...leftRecord } = record;
    return createRecord(leftRecord);
  }, [createRecord]);

  /*发送请求保存数据*/
  const requestUpsert = useCallback(async (
    {
      sourceRecord, editRecord, isCreateRecord, isFormCreate,
    }: {
      sourceRecord: PlainObject, editRecord: PlainObject,
      isCreateRecord: boolean,/*是否为行内编辑新建的数据*/
      isFormCreate: boolean,/*是否由表单编辑新建的数据*/
    }
  ) => {

    const showIndex = isFormCreate ? 0 : await getShowIndex(sourceRecord);

    try {

      console.log("upsert:行原始数据：", sourceRecord);
      console.log("upsert:行编辑数据：", editRecord);

      /*将undefined的字段值修改为null，因为后端是按字段更新，undefined的字段在请求时会被过滤导致无法更新字段值*/
      Object.keys(editRecord).forEach(key => {editRecord[key] === undefined && (editRecord[key] = null);});

      const requestRecord = {
        ...sourceRecord,
        ...editRecord,
        /*如果id以!_开头说明是前端临时生成的id，保存时不传递给后端*/
        id: sourceRecord.id.startsWith('!_') ? undefined : sourceRecord.id,
      };

      const requestConfig: AxiosRequestConfig = {
        url: `/general/${config.module}/${isCreateRecord ? 'insert' : 'update'}`,
        method: 'post',
        data: {
          row: requestRecord
        },
      };

      await (isCreateRecord ? hooks.onBeforeInsert : hooks.onBeforeUpdate).exec({ record: requestRecord, requestConfig });

      const resp = await http.request<{ result: PlainObject }>(requestConfig);

      if (isFormCreate) {
        setStateData(prevList => [resp.data.result, ...prevList]);
      } else {
        /*不论如何都要更新stateData中对应的数据*/
        setStateData(prevList => prevList.map(i => i.id === sourceRecord.id ? { ...i, ...resp.data.result } : i));

        if (isCreateRecord) {
          /*如果是新建的数据，先删除stateCreateData中的标记数据*/
          setStateCreateIdMapper(prevMapper => omit(prevMapper, [sourceRecord.id]));
        } else {
          /*否则是编辑，将编辑中的数据删除对应的标记数据*/
          setStateEditIdMapper(prevMapper => omit(prevMapper, [sourceRecord.id]));
        }
      }

      await (isCreateRecord ? hooks.onAfterInsert : hooks.onAfterUpdate).exec({ result: resp.data.result, responseData: resp.data });

      message.success(`第 ${showIndex} 行保存成功`);
    } catch (e) {
      showError(`第 ${showIndex} 行保存失败：` + getErrorMessage(e));
    }
  }, [config.module, getShowIndex, setStateCreateIdMapper, setStateEditIdMapper, setStateData, hooks]);

  /*表单新建数据*/
  const formCreateRecord = useCallback(async (initialValues?: PlainObject) => {

    /*默认的新行数据*/
    const initialNewRecord = await getDefaultNewRow(initialValues);
    const newestConfig = await getNewestValue(setConfig);

    await editRecordWithDrawer({
      record: initialNewRecord,
      columns: newestConfig.columns,
      index: 0,
      save: async (editRecord) => requestUpsert({ sourceRecord: initialNewRecord, editRecord, isCreateRecord: true, isFormCreate: true })
    });
  }, [editRecordWithDrawer, getDefaultNewRow, requestUpsert, setConfig]);

  /*取消编辑行数据*/
  const cancelEditRecord = useCallback(async (record?: PlainObject | PlainObject[]) => {

    /*没有传递record，就说明是取消所有行的编辑动作，否则目标行数据的编辑动作*/
    const targetRows = !record ? await getNewestValue(setStateData) : toArray(record);
    /*将targetRows转成id mapper*/
    const targetIdMapper = getRowsMapper(targetRows);
    /*获取最新的StateCreateIdMapper，用于删除stateData中的新建数据*/
    const newestStateCreateIdMapper = await getNewestValue(setStateCreateIdMapper);

    /*删掉stateData中，targetRows中的新建数据*/
    setStateData(prevList => prevList.filter(i => !(!!newestStateCreateIdMapper[i.id] && !!targetIdMapper[i.id])));
    /*删除stateEditIdMapper中 targetRows的编辑标记*/
    setStateEditIdMapper(prevMapper => !record ? {} : omit(prevMapper, Object.keys(targetIdMapper)));
    /*删除stateCreateIdMapper中 targetRows的新建标记*/
    setStateCreateIdMapper(prevMapper => !record ? {} : omit(prevMapper, Object.keys(targetIdMapper)));

  }, [setStateData, setStateEditIdMapper, setStateCreateIdMapper]);

  /*删除数据*/
  const deleteRecord = useCallback(async (record: PlainObject) => {
    console.log('delete record', record);
    const requestConfig: AxiosRequestConfig = {
      url: `/general/${config.module}/delete`,
      method: 'post',
      data: { id: record.id },
    };
    await hooks.onBeforeDelete.exec({ record, requestConfig });
    try {
      setStateLoading(true);
      const resp = await http.request<{ deletedRows: number }>(requestConfig);
      if (resp.data.deletedRows >= 1) {
        message.success("删除成功");
      } else {
        showError("删除失败");
      }
      await hooks.onAfterDelete.exec({ responseData: resp.data });
      /*删除完毕之后重新加载当前页数据*/
      await load();
    } catch (e) {
      showError(e);
    } finally {
      setStateLoading(false);
    }
  }, [config.module, load, setStateLoading, hooks]);

  /*保存一条数据*/
  const saveRecord = useCallback(async (record: PlainObject, validate = true) => {

    const isCreateRecord = !!stateCreateIdMapper[record.id];
    let showIndex = await getShowIndex(record);

    if (showIndex === -1) {
      showError("[0x01]组件渲染异常，保存的数据不在列表中。");
      return;
    }

    const form = formInstanceManager.get(record);
    if (!form) {
      showError("[0x01]组件渲染异常，form实例不存在。");
      return;
    }

    let editRecord;

    if (validate) {
      try {
        editRecord = await form?.validateFields();
      } catch (e) {
        showError(`第 ${showIndex} 行校验不通过：` + getErrorMessage(e));
        return;
      }
    } else {
      editRecord = form.getFieldsValue();
    }

    try {
      setStateLoading(true);
      await requestUpsert({ sourceRecord: record, editRecord, isCreateRecord, isFormCreate: false });
    } finally {
      setStateLoading(false);
    }

  }, [formInstanceManager, stateCreateIdMapper, setStateLoading, getShowIndex, requestUpsert]);

  /*表单编辑数据*/
  const formEditRecord = useCallback(async ({ record, isCreateRecord }: { record: PlainObject, isCreateRecord: boolean }) => {
    const newestConfig = await getNewestValue(setConfig);
    await editRecordWithDrawer({
      record: record,
      index: await getIndex(record),
      columns: newestConfig.columns,
      save: async (editRecord) => requestUpsert({ sourceRecord: record, editRecord, isCreateRecord: isCreateRecord, isFormCreate: false })
    });
  }, [editRecordWithDrawer, requestUpsert, setConfig, getIndex]);

  /*取消编辑*/
  const cancel = useCallback(async () => {await cancelEditRecord();}, [cancelEditRecord]);

  /*保存编辑*/
  const save = useCallback(async () => {
    const editingRows = stateData.filter(record => stateEditIdMapper[record.id]);
    editingRows.map(record => saveRecord(record));
  }, [stateData, stateEditIdMapper, saveRecord]);

  const saveRef = useRef(save);
  saveRef.current = save;

  useStrictMounted(async () => {
    /*双击行的时候开启行的编辑状态*/
    hooks.onDblClickRow.on(async ({ record }) => {
      // console.log(record);
      const newestConfig = await getNewestValue(setConfig);
      newestConfig.editRowOnDblClick && newestConfig.showEditButton && newestConfig.showOperateColumn && editRecord(record);
    });

    /*点击标题的时候触发这个字段的降序功能*/
    hooks.onClickTitle.on(async ({ column }) => {
      if (column.sortable) {
        const stateSortData = await getNewestValue(setStateSortData);
        if (stateSortData.length === 1 && stateSortData[0].field === column.dataIndex) {
          setStateSortData([{ field: String(column.dataIndex), desc: !stateSortData[0].desc }]);
        } else {
          setStateSortData([{ field: String(column.dataIndex), desc: true }]);
        }
        await reload();
      }
    });
  });

  return {
    load,
    reload,
    editRecord,
    createRecord,
    copyRecord,
    cancelEditRecord,
    deleteRecord,
    saveRecord,
    cancel,
    save,
    saveRef,
    formEditRecord,
    formCreateRecord,
  };

}

export type iAutoOptionMethods = ReturnType<typeof useAutoOptionMethods>;

declare module '../auto-table.utils' {
  export interface iAutoOption {
    methods: iAutoOptionMethods;
  }
}
