//MCP服务器类
const {McpServer}= require("@modelcontextprotocol/sdk/server/mcp.js");
//MCP传输方式类
const {StdioServerTransport} = require("@modelcontextprotocol/sdk/server/stdio.js")
//用于数据验证
const {z}=require("zod")
//创建一个MCP服务器
const server = new McpServer({
    name:"greeting-server",
    version:"1.0.0"
})
//注册一个叫greeting的工具到server上
server.registerTool(
    "greet",//工具的名称
    {
        description:"通过名字向某人问好",//工具的描述
        //工具输入参数的schema定义
        inputSchema:{
            //name参数是字符串类型，并带有描述
            name:z.string().describe("要问候的人的名字")
        }
    },
    async ({name})=>({
        //返回的内容，类型为text,文本的内容为 你好,xxx
        content:[
            {type:'text',text:`你好，${name}`}
        ]
    })
)
async function main(){
    //创建标准输入输出传输层实例
    const trasport = new StdioServerTransport()
    //让server通过transport与客户端进行连接
    await server.connect(trasport)
}
main().catch(error=>{
    console.error(err)
    //用非正常的状态码退出进程
    process.exit(1)
})