// 定义泛型类 Box
var Box = /** @class */ (function () {
    function Box(value) {
        // 初始化方法，接受类型为 T 的值
        this.value = value;
    }
    Box.prototype.get = function () {
        // 获取值，返回类型为 T
        return this.value;
    };
    Box.prototype.set = function (newValue) {
        // 设置值，参数类型为 T
        this.value = newValue;
    };
    return Box;
}());
// 主程序入口
// 创建存放整数的盒子
// Box<number> 表示这个盒子存放整数
var intBox = new Box(42);
console.log("\u6574\u6570\u76D2\u5B50\uFF1A".concat(intBox.get()));
// 创建存放字符串的盒子
// Box<string> 表示这个盒子存放字符串
var strBox = new Box("Hello");
console.log("\u5B57\u7B26\u4E32\u76D2\u5B50\uFF1A".concat(strBox.get()));
// 创建存放列表的盒子
// Box<number[]> 表示这个盒子存放数字数组
var listBox = new Box([1, 2, 3]);
console.log("\u5217\u8868\u76D2\u5B50\uFF1A".concat(listBox.get()));
