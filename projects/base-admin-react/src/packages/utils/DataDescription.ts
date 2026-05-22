/**
 * 一个数据类型检查工具
 *
 * 使用 “createDescription” 创建一个类型描述配置对象
 * 使用 “checkValueByDescription” 来对目标值进行检查
 * @date    2025/5/26 18:11
 */

/*---------------------------------------definition start-------------------------------------------*/

type iConstructor<T> = { new(): T }
type iDescriptionWithoutDefault<T> = { type: iConstructor<T> }
type iDescriptionWithDefault<T> = { type: iConstructor<T>, default: () => T }

type iObjectValueType<T> =
  T extends iConstructor<infer TT> ? TT : {
    [k in keyof T]: T[k] extends iConstructor<infer R1> ? (R1 | undefined) : (
      T[k] extends iDescriptionWithDefault<infer R2> ?
        R2 : T[k] extends iDescriptionWithoutDefault<infer R2> ? (R2 | undefined) : unknown
      )
  };

type iObjectDescription = { [k: string]: iConstructor<any> | iDescriptionWithoutDefault<any> | iDescriptionWithDefault<any> }

export function createDescription<Description extends iObjectDescription | iConstructor<any>>(description: Description) {return description;}

export function createArrayFieldDescription<Description extends iObjectDescription | iConstructor<any>>(description: Description): iDescriptionWithoutDefault<iObjectValueType<Description>[]>
export function createArrayFieldDescription<Description extends iObjectDescription | iConstructor<any>>(description: Description, _default: () => Partial<iObjectValueType<Description>>[]): iDescriptionWithDefault<iObjectValueType<Description>[]>
export function createArrayFieldDescription<Description extends iObjectDescription | iConstructor<any>>(description: Description, _default?: () => any) {
  return !!_default ? { type: description, default: _default } : { type: description };
}

export function createObjectFieldDescription<Description extends iObjectDescription>(description: Description): iDescriptionWithoutDefault<iObjectValueType<Description>>
export function createObjectFieldDescription<Description extends iObjectDescription>(description: Description, _default: () => Partial<iObjectValueType<Description>>): iDescriptionWithDefault<iObjectValueType<Description>>
export function createObjectFieldDescription<Description extends iObjectDescription>(description: Description, _default?: () => any) {
  return !!_default ? { type: description, default: _default } : { type: description };
}

function checkValueByFieldDescription<Value>(checkValue: Value, fieldDescription: iConstructor<any> | iDescriptionWithoutDefault<any> | iDescriptionWithDefault<any>): Value {
  if (checkValue == null) {
    /*没有值，尝试获取默认值*/
    if ('default' in fieldDescription) {checkValue = fieldDescription.default();}
  }
  /*没有默认值*/
  if (checkValue == null) {return checkValue;}

  /*只有当 fieldDescription.type 为object的时候，才去递归检查checkValue的每一个属性值*/
  if (!('type' in fieldDescription && typeof fieldDescription.type === "object")) {return checkValue;}

  if (Array.isArray(checkValue)) {
    for (let i = 0; i < checkValue.length; i++) {
      checkValue[i] = checkValueByDescription(checkValue[i], fieldDescription.type);
    }
  } else if (typeof checkValue === "object") {
    checkValue = checkValueByDescription(checkValue, fieldDescription.type);
  }

  return checkValue;
}

export function checkValueByDescription<T extends iObjectDescription>(checkValue: any, objectDescription: T): iObjectValueType<T> {
  if (checkValue == null) {checkValue = {};}
  Object.entries(objectDescription).forEach(([key, fieldDescription]) => {
    checkValue[key] = checkValueByFieldDescription(checkValue[key], fieldDescription);
  });
  return checkValue;
}

/*使用这个来代替默认的String，Number以及Boolean基础数据类型构造函数，因为*/
/*原来的这些构造函数返回但是包装对象，这个包装对象与基础数据类型是不匹配的*/
export const DataDescriptionTypes = {
  String: String as any as { new(): string },
  Number: String as any as { new(): number },
  Boolean: Boolean as any as { new(): boolean },
};
/*---------------------------------------definition end-------------------------------------------*/
