// 引入 Node.js 内置的 http 模块
const http = require('http');

// 定义服务器监听的端口号为 1000
const PORT = 1000;

// 创建一个 HTTP 服务器实例
const server = http.createServer((req, res) => {
  // 设置响应状态码为 200（成功）
  res.statusCode = 200;
  // 设置响应头，指定内容类型为纯文本
  res.setHeader('Content-Type', 'text/plain');
  // 结束响应并返回消息内容
  res.end('1000');
});

// 启动服务器，监听指定端口
server.listen(PORT, () => {
  // 服务器启动后在控制台输出提示信息
  console.log(`Server running at http://localhost:${PORT}/`);
});