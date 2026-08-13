
const obj = {name:'bob',age:25}
//允许 修改属性 允许 删除属性，但不允许添加新属性
Object.preventExtensions(obj)
obj.name = 'mike'
delete obj.age
obj.email = 'bob@qq.com'

//允许 修改属性，但不允许 删除和添加属性
Object.seal(obj)
obj.name = 'mike'
delete obj.age
obj.email = 'bob@qq.com'

//不允许修改、删除和添加属性
Object.freeze(obj)