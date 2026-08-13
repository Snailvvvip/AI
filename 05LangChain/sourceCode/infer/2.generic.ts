// 定义泛型类 Box
class Box<T> {
    // 用于存放任何类型值的盒子
    private value: T;

    constructor(value: T) {
        // 初始化方法，接受类型为 T 的值
        this.value = value;
    }

    get(): T {
        // 获取值，返回类型为 T
        return this.value;
    }

    set(newValue: T): void {
        // 设置值，参数类型为 T
        this.value = newValue;
    }
}
// 主程序入口
// 创建存放整数的盒子
// Box<number> 表示这个盒子存放整数
const intBox: Box<number> = new Box(42);
console.log(`整数盒子：${intBox.get()}`);

// 创建存放字符串的盒子
// Box<string> 表示这个盒子存放字符串
const strBox: Box<string> = new Box<string>("Hello");
console.log(`字符串盒子：${strBox.get()}`);

// 创建存放列表的盒子
// Box<number[]> 表示这个盒子存放数字数组
const listBox: Box<number[]> = new Box<number[]>([1, 2, 3]);
console.log(`列表盒子：${listBox.get()}`);