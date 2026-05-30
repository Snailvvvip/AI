const path = require('path')
const {Client} = require("@modelcontextprotocol/sdk/client/index.js")
const {StdioClientTransport} = require("@modelcontextprotocol/sdk/client/stdio.js")
const { describe } = require('zod/v4/core')
//获取MCP服务器端的脚本的绝对路径
const SERVER_SCRIPT = path.join(__dirname,'mcp_server.js')
//定义全局的mcp client实例
let client = null
//保存MCP服务器可有的工具集合
const toolNames = new Set()
//保存适用于openAI工具定义列表
let openAiToolDefinitions = []
//MCP工具转换为OpenAI工具定义
function mcpToolToOpenAI(tool){
  //获取输入参数的schema,默认为空对象
  const schema = tool.inputSchema ||{type:'object',properties:{}}
  //返回OpenAI格式的工具定义对象
  return {
    type:'function',
    function:{
        name:tool.name,//工具名称
        description:tool.description||`MCP工具:${tool.name}`,//工具描述
        parameters:schema // 工具的参数
    }
  }
}

async function connectMcpServer(){
    //如果已经连接过了，则直接返回相关参数
    if (client) return {
        client,toolNames,openAiToolDefinitions
    }
    //创建transport用于连接 MCP服务器
    const transport = new StdioClientTransport({
        //指定node.js的可执行文件的路径
        command:process.execPath,
        //启动MCP的服务器脚本
        args:[SERVER_SCRIPT],
        //指定义当前的工作目录
        cwd:path.dirname(SERVER_SCRIPT),
        //标准错误输出使用管道
        stderr:'pipe'
    })
    //创建一个MCP客户端
    client = new Client({name:'mcp-client',version:'1.0.0'})
    //父进程就是MCP客户端的进程 子进程就是MCP服务器的进程
    //建立与服务器的连接  原理 会启动一个子进程，在子进程里运行服务器端脚本，然后通过子进程的stdio与父进行进行通信 stdout stdin
    await client.connect(transport)
    //获取MCP服务器所有的工具列表
    const {tools} = await client.listTools()
    //工具定义转换为OpenAI格式
    openAiToolDefinitions  = tools.map(mcpToolToOpenAI)
    //清空旧的工具集合
    toolNames.clear()
    //把最新的每个工具的名称添加到工具名称集合中
    for(const tool of tools){
        toolNames.add(tool.name)
    }
    console.log(`已经连接MCP服务器(stdio-${SERVER_SCRIPT}),工具:${[...toolNames].join(',')}`)

    return {
        client,
        toolNames,
        openAiToolDefinitions
    }
}
//获取所有的 OpenAI格式的MCP工具定义
function getMcpOpenAiTools(){
    return openAiToolDefinitions
}
//判断给定的名称是否是MCP工具
function isMcpTool(name){
    return toolNames.has(name)
}
//把MCP执行结果转为纯文本
function mcpResultToText(result){
    if (!result?.content?.length)return `MCP无返回内容`
    return result.content.filter(block=>block.type=='text').map(block=>block.text).join('\n')
}
//调用MCP工具
async function callMcpTool(name,arguments){
    if (!client)throw new Error("MCP未连接")
    //指定调用的工具名称和工具的参数
    const result = await client.callTool({name,arguments})
    return mcpResultToText(result)
}
//关闭与MCP服务器听连接并释放清理资源
async function closeMcpConnection(){
    if(client){
        await client.close()
        client = null;
        toolNames.clear()
        openAiToolDefinitions=[]
    }
}
module.exports = {
    connectMcpServer,
    getMcpOpenAiTools,
    isMcpTool,
    callMcpTool,
    closeMcpConnection
}