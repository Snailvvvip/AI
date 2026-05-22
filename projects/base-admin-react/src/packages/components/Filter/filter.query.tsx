import {PlainObject} from "@peryl/utils/event";
import {deepcopy} from "@peryl/utils/deepcopy";
import {createCounter} from "@peryl/utils/createCounter";
import {iAutoColumnType} from "../AutoTable/columns/auto-table.columns";

export type PartialFields<T, Field extends keyof T> = Omit<T, Field> & Partial<Pick<T, Field>>

/**
 * 筛选符类型
 * @author  韦胜健
 * @date    2023.1.4 21:33
 */
export const eFilterOperator = {
  // eslint-disable-next-line no-useless-computed-key
  ['eq']: '=',                      // 精确查询
  // eslint-disable-next-line no-useless-computed-key
  ['like']: '~',                    // 模糊查询
  // eslint-disable-next-line no-useless-computed-key
  ['gt']: '>',                      // 大于
  // eslint-disable-next-line no-useless-computed-key
  ['gte']: '>=',                    // 大于等于
  // eslint-disable-next-line no-useless-computed-key
  ['lt']: '<',                      // 小于
  // eslint-disable-next-line no-useless-computed-key
  ['lte']: '<=',                    // 小于等于
  // eslint-disable-next-line no-useless-computed-key
  ['in']: 'in',                     // 包含查询
  // eslint-disable-next-line no-useless-computed-key
  ['not_in']: 'not in',             // 非包含查询
  // eslint-disable-next-line no-useless-computed-key
  ['in_like']: 'in like',           // 包含模糊查询
  // eslint-disable-next-line no-useless-computed-key
  ['not_in_like']: 'not in like',   // 非包含模糊查询
  // eslint-disable-next-line no-useless-computed-key
  ['is_null']: 'is null',           // 为空
  // eslint-disable-next-line no-useless-computed-key
  ['is_not_null']: 'is not null',   // 不为空
} as const;

const FilterOperatorText: Record<keyof typeof eFilterOperator, (value: string) => string> = {
  eq: (value) => `等于"${value}"`,
  like: (value) => `类似于"${value}"`,
  gt: (value) => `大于"${value}"`,
  gte: (value) => `大于等于"${value}"`,
  lt: (value) => `小于"${value}"`,
  lte: (value) => `小于等于"${value}"`,
  in: (value) => `包含"${value}"`,
  not_in: (value) => `排除"${value}"`,
  in_like: (value) => `包含类似"${value}"`,
  not_in_like: (value) => `排除类似"${value}"`,
  is_null: (value) => "为空",
  is_not_null: (value) => "不为空",
};

/**
 * 单个筛选参数
 * @author  韦胜健
 * @date    2023.1.4 21:35
 */
export interface iFilterQueryMeta {
  id: string,
  field: string,
  operator: (typeof eFilterOperator)[keyof typeof eFilterOperator],
  value?: any,
}

/**
 * 发请求时，筛选查询参数类型
 * @author  韦胜健
 * @date    2023.1.4 21:46
 */
export type iFilterQueryParam = { queries?: iFilterQueryMeta[], expression?: string, } & Record<string, any>

/**
 * filter handler的getQueryParam返回的query meta类型
 * @author  韦胜健
 * @date    2023.1.5 0:44
 */
export type iFilterHandlerQueryMeta = PartialFields<iFilterQueryMeta, 'id'>

/**
 * filter handler返回的参数类型
 * @author  韦胜健
 * @date    2023.1.5 0:45
 */
export type iFilterHandlerQueryParam = {
  queries?: iFilterHandlerQueryMeta[],
  expression?: string,
} & Record<string, any>

/*合并筛选参数*/
export function mergeQueryParam(...queryParamList: (iFilterQueryParam | iFilterHandlerQueryParam | null | undefined | void)[]): iFilterQueryParam {
  const requestData: PlainObject = {};
  /*没有涉及到expression的简单筛选条件，以and的逻辑连接*/
  const outerFilterHandlerQueryMetaList: iFilterHandlerQueryMeta[] = [];
  /*设计到expression的复杂筛选条件，以expression的逻辑连接*/
  const groupFilterHandlerQueryMetaList: { queries: iFilterHandlerQueryMeta[], expression: string }[] = [];

  queryParamList.forEach((itemQueryParam) => {
    if (!itemQueryParam) {return;}
    const { queries, expression, ...itemRequestData } = deepcopy(itemQueryParam);
    if (!!queries) {
      if (!!expression && queries.length > 1) {
        /*当返回多个queryMeta的时候，才会处理expression（只有一个queryMeta的话当做无特殊逻辑处理）*/
        /*如果有返回expression，则将返回的queryMeta视为一个分组*/
        groupFilterHandlerQueryMetaList.push({ expression, queries });
      } else {
        /*否则将queryMeta与其他的queryMeta做and连接*/
        outerFilterHandlerQueryMetaList.push(...queries);
      }
    }
    Object.assign(requestData, itemRequestData);
  });

  let paramQueries: iFilterQueryMeta[] = [];
  let paramExpression: string | null = null;

  /*没有设置id的给补充id*/
  const outerFilterQueryMetaList: iFilterQueryMeta[] = outerFilterHandlerQueryMetaList.map(i => ({ ...i, id: i.id || nextQueryMetaId() }));

  if (groupFilterHandlerQueryMetaList.length > 0) {
    /*最外层无特殊逻辑的filtersRaw无论如何都不需要使用小括号包裹，否则会导致语法错误*/
    const expressionList =
      outerFilterQueryMetaList.length > 0
        ? [`${outerFilterQueryMetaList.map((i) => i.id).join(' and ')}`]
        : [];
    groupFilterHandlerQueryMetaList.forEach(({ expression, queries }) => {
      queries.forEach((i) => {
        if (!i.id) {
          console.log(i);
          console.error(
            `分组的filtersRaw每一项都不能缺少id，并且分组的filterOperator字符串应该含有使用这个id!`
          );
        }
      });
      outerFilterQueryMetaList.push(...queries as iFilterQueryMeta[]);
      expressionList.push(`(${expression})`);
    });
    paramQueries = outerFilterQueryMetaList;
    paramExpression = expressionList.join(' and ');
  } else {
    paramQueries = outerFilterQueryMetaList;
    paramExpression = null;
  }
  /*while (
    !!paramExpression &&
    paramExpression.charAt(0) === '(' &&
    paramExpression.charAt(paramExpression.length - 1) === ')'
    ) {
    paramExpression = paramExpression.slice(1, -1);
  }*/
  return {
    ...requestData,
    ...(paramQueries.length > 0 ? { queries: paramQueries } : {}),
    ...(!!paramExpression && paramExpression.length > 0
      ? { expression: paramExpression }
      : {})
  };
}

/**
 * 获取一个新的FiltersRaw的id
 * @author  韦胜健
 * @date    2022.9.8 16:27
 */
export const nextQueryMetaId = createCounter('query_meta');

/*将筛选条件转化为可显示的文本描述*/
export async function getQueryDescription(queryParam: iFilterQueryParam | iFilterHandlerQueryParam, columns: iAutoColumnType[]) {
  /*处理每个筛选条件，没有id就设置默认的id，如果对应的字段有getFilterText转化函数，则将值转化为对应的显示值*/
  const queries = await Promise.all(queryParam.queries?.map(async i => {
    const item = { ...i, id: i.id ?? nextQueryMetaId() };
    const col = columns.find(i => i.dataIndex === item.field);
    if (!!col && col.getFilterText && item.value != null) {
      item.value = Array.isArray(item.value) ? await Promise.all(item.value.map(i => col.getFilterText!(i))) : await col.getFilterText(item.value);
    }
    return item;
  }) ?? []);
  /*表达式*/
  const expression = queryParam.expression ?? queries.map(i => i.id).join(' and ');
  /*将表达式中的id转化为查询条件*/
  return expression.replace(
    new RegExp(`(${queries.map(i => i.id).join('|')}|and|or)`, 'igm'),
    (input, id) => {
      if (id === 'and') {return '并且';}
      if (id === 'or') {return '或者';}
      const queryMeta = queries.find(i => i.id === id);
      if (!queryMeta) {return id;}
      const col = columns.find(i => i.dataIndex === queryMeta.field);
      if (!col) {return id;}
      const operatorName = Object.entries(eFilterOperator).find(([k, v]) => v === queryMeta.operator)?.[0];
      if (!operatorName) {return id;}
      return `${col.originTitle} ${operatorName in FilterOperatorText ? (FilterOperatorText as any)[operatorName](String(queryMeta.value)) : queryMeta.operator}`;
    });
}

// console.log('_getQueryDescription', getQueryDescription({
//   "queries": [
//     { "id": "f1", "field": "discountPrice", "operator": ">", "value": 1000 },
//     { "id": "f2", "field": "discountPrice", "operator": "<", "value": 1500 },
//     { "id": "f3", "field": "sales", "operator": ">", "value": 200 }
//   ],
//   "expression": " ( f1 and f2 ) or f3 "
// }, createHotelConfig().columns));
