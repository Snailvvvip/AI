//用于读取终端输入
const readline = require('readline');
//加载.env配置文件，并允许覆盖已经存在的环境变量
require("dotenv").config({ override: true })
//从openai包引入OpenAI与大模型交互的客户端类
const { OpenAI } = require("openai")
//引入Node.js中的path模块，用于处理和转换文件的路径
const path = require("path");
//引入子进程模块，用于开启子进程执行同步或异步命令
const { spawn, spawnSync, exec } = require("child_process")
//WINDOWS控制台编码为GBK(cp936),如果直接用UTF8解码的话会乱码
const iconv = require("iconv-lite");
//引入fs/promises模块，用于读写文件，提供基于promise的文件系统操作方法
const fsp = require("fs/promises");
const { buffer } = require('stream/consumers');
//创建OpenAI的客户端实例，使用DeepSeek的APIKEY和baseURL
const openaiClient = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY
})
//引入MCP客户端模块
const {connectMcpServer,getMcpOpenAiTools,isMcpTool,callMcpTool,closeMcpConnection} = require('./mcp_client')
const {
    loadSkills,//加载所有的技能
    enrichSystem,//丰富系统提示词
    parseSlash,//解析用的输入 如果是以/开头的话说明要使用skill
    getSkill //根据skill的名称获取对应的skill正文

} = require("./skills")
//定义代理的系统提示词
const AGENT_SYSTEM_INSTRUCTION_BASE = `你是[Claude Code],在受控的workspace内协助用户读改代码，跑命令的智能助手,当用户要求执行某些操作的时候，可以调用MCP工具`
//存储Agent系统指令
let agentSystemInstruction = AGENT_SYSTEM_INSTRUCTION_BASE
//存储所有的后台拉起的子进程的注册表
const backgroundProcesses = new Map()
//创建一个readline接口，指定输入输出为标准输入输出
const rl = readline.createInterface({
    input: process.stdin,//标准输入流
    output: process.stdout,//标准输出流
    terminal: true//是否启用终端模式
})
//监听SIGINT(通常指的是Ctrl+C)事件，只监听一次
rl.once('SIGINT', () => {
    //打印中断提示信息，换两行
    console.log("\n已中断，下次再见")
    //关闭readline接口
    rl.close()
    //退出当前的进程，状态码设置为0(正常退出)
    process.exit(0)
})
//定义工作区根目录，位于当前目录下面的workspace文件夹中
const WORKSPACE_ROOT = path.resolve(process.cwd(), "workspace")
function isDescendantOrSameDirectory(candidatePath) {
    const targetAbs = path.resolve(candidatePath)
    if (WORKSPACE_ROOT == targetAbs) return true
    //计算目标路径相对于工作区根目录的相对路径
    const relative = path.relative(WORKSPACE_ROOT, targetAbs)
    //如果不是空字符串，不以..点，也不是绝对路径，则说明在工作区内，可以返回true
    return relative != "" && !relative.startsWith("..") && !path.isAbsolute(relative)
}

//在工作区内解析路径，并校验是否越界
function resolvePathInsideWorkspace(relativePath) {
    //将相对路径解析为工作区下的绝对路径
    const candidatePath = path.resolve(WORKSPACE_ROOT, relativePath)
    //如果说解析后的路径不在工作区内，就意味着路径越界了，抛出异常
    if (!isDescendantOrSameDirectory(candidatePath)) {
        throw new Error(`路径越界:${candidatePath}`)
    }
    //返回校验通过的绝对路径
    return candidatePath

}
//文本读取工具的实现
class ReadText {
    //执行读取操作 参数为{path}
    async run({ path: relativePath }) {
        try {
            return await fsp.readFile(resolvePathInsideWorkspace(relativePath), 'utf-8')
        } catch (err) {
            //如果找不到文件，则返回自定义的提示，否则返回异常的原因
            return err.code === 'ENOENT' ? `找不到文件:${relativePath}` : `读取异常:${err.message}`
        }
    }
}
//文本写入工具的实现
class WriteText {
    //执行写入操作 参数为{path,content}
    async run({ path: relativePath, content }) {
        try {
            //解析目标文件的绝对路径
            const absolute = resolvePathInsideWorkspace(relativePath)
            //如果父级目录不存在则需要递归创建
            await fsp.mkdir(path.dirname(absolute), { recursive: true })
            //写入内容到文件中，使用UTF8编码
            await fsp.writeFile(absolute, content, "utf-8")
            return `已落盘${Buffer.byteLength(content, 'utf-8')}字节 -> ${relativePath}`
        } catch (err) {
            return `写入异常:${err.message}`
        }
    }
}
//用于精确修改文件的内容
class EditFile {
    //接收文件路径，要替换的旧文本，以及新文本
    async run({ path: relativePath, oldText, newText }) {
        try {
            //解析目标文件的绝对路径
            const absolute = resolvePathInsideWorkspace(relativePath)
            //以UTF8编码读取文件的内容
            const before = await fsp.readFile(absolute, 'utf-8')
            //检查原来的文件内容是是否包含被替换的文件，如果没有则给出提示
            if (!before.includes(oldText)) return `文件中未出现与oldText完全一致的片段`
            //将第一次出现的oldText替换为newText,并写回原文件
            await fsp.writeFile(absolute, before.replace(oldText, newText), 'utf-8')
            return `已成功替换了文件内容:${relativePath}`
        } catch (err) {
            //如果找不到文件，则返回自定义的提示，否则返回异常的原因
            return err.code === 'ENOENT' ? `找不到文件:${relativePath}` : `读取异常:${err.message}`
        }
    }
}
//列出目录里的内容
class ListDir {
    //执行写入操作 参数为{path,content}
    async run({ path: relativePath }) {
        try {
            //解析目标文件的绝对路径
            const absolute = resolvePathInsideWorkspace(relativePath)
            //获取目标路径的文件状态信息
            const stat = await fsp.stat(absolute)
            //判断目标路径是否为目录，如果不是目录则返回报错信息
            if (!stat.isDirectory()) {
                return `目标路径不是一个目录:{relativePath}`
            }
            //读取目录下面的所有的条目，并且获取类型信息
            const entries = await fsp.readdir(absolute, { withFileTypes: true })
            //根据名称进行字典排序
            entries.sort((a, b) => a.name.localeCompare(b.name))
            //格式化每个条目，区分目录还是文件
            const rows = entries.map((entry) => `${entry.isDirectory() ? "目录：" : "文件："} ${entry.name}`)
            //如果有内容则按行拼接返回，否则 返回空目录提示
            return rows.length > 0 ? rows.join("\n") : "(空目录)"
        } catch (err) {
            //如果找不到文件，则返回自定义的提示，否则返回异常的原因
            return err.code === 'ENOENT' ? `找不到文件:${relativePath}` : `读取异常:${err.message}`
        }
    }
}
//工具的Schema定义，描述每个工具的用途和参数结构
//现在这里放的是本地的或者说claude自带的工具列表
const LOCAL_MODEL_TOOL_DEFINATIONS = [
    {
        "type": "function",//声明工具的类型为函数
        "function": {
            name: "readFile",//工具的名称为readFile
            description: "以UTF-8编码读取工作区内的文本文件",//工具功能描述
            parameters: {//工具参数定义
                type: "object",//参数类型为对象
                properties: { path: { type: "string" } },//参数属性为path,字符串类型
                required: ["path"]//要想调用这个工具，必须传递path参数，path参数是必需的参数
            }
        }
    },
    {
        "type": "function",//声明工具的类型为函数
        "function": {
            name: "writeFile",//工具的名称为writeFile
            description: "在工作区内新建或覆盖写入文件",//工具功能描述
            parameters: {//工具参数定义
                type: "object",//参数类型为对象
                properties: {
                    path: { type: "string", "description": "文件路径" },//参数属性为path,字符串类型
                    content: { type: "string" }//conent为要写入的文件内容，字符串类型
                },
                required: ["path", "content"]//要想调用这个工具，必须传递path和content参数，path参数和content参数都必需的参数
            }
        }
    },
    {
        "type": "function",//声明工具的类型为函数
        "function": {
            name: "editFile",//工具的名称为editFile
            description: "对已有文本做一次精确的子串替换，oldText必须与文件内容完全一致",//工具功能描述
            parameters: {//工具参数定义
                type: "object",//参数类型为对象
                properties: {
                    path: { type: "string", "description": "待修改的文件路径" },//参数属性为path,字符串类型
                    oldText: { type: "string", "description": "要被替换的原文(唯一一次匹配)" },
                    newText: { type: "string", "description": "替换后的新文本" },
                },
                required: ["path", "oldText", "newText"]//要想调用这个工具，必须传递path和content参数，path参数和content参数都必需的参数
            }
        }
    },
    {
        "type": "function",//声明工具的类型为函数
        "function": {
            name: "listDir",//工具的名称为listDir
            description: "罗列目录下的条目(包含子文件夹标识)，用于快速摸清目录结构",//工具功能描述
            parameters: {//工具参数定义
                type: "object",//参数类型为对象
                properties: {
                    path: { type: "string", "description": "文件路径" },//参数属性为path,字符串类型
                },
                required: ["path", "content"]//要想调用这个工具，必须传递path参数
            }
        }
    },
    {
        "type": "function",//声明工具的类型为函数
        "function": {
            name: "runCommand",//工具的名称为runCommand
            description:
                "在shell中执行命令，短命令阻塞直至结束，疑似开发服务器的命令会在后台拉起\n" +
                "重要:命令会在当前的目录中执行，不要轻易使用cd命令切换目录\n" +
                "常规： install / build / test 等同步执行，stdout和stderr汇总返回\n"+
                "常驻： pnpm dev 、npm start、uvicorn 、flask run 等后台运行,约8秒后回传PID与启动阶段日志。\n"+
                "后台子命令:\n"+
                "    task_list        列出已登记的后台任务列表\n"+
                "    task_logs <pid>  拉取该PID最近若干行合并输出\n"+
                "    task_stop <pid>  结束该PID对应的后台任务\n"
            ,//工具功能描述
            parameters: {//工具参数定义
                type: "object",//参数类型为对象
                properties: {
                    commandLine: { type: "string", "description": "shell命令行(例如 npm install)" },//参数属性为commandLine,字符串类型
                },
                required: ["commandLine"]//要想调用这个工具，必须传递path参数
            }
        }
    },
    {
        "type": "function",//声明工具的类型为函数
        "function": {
            name: "readSkill",//工具的名称为readSkill
            description:"加载skill完整正文：任务与系统提示中的skill描述匹配时使用",
            parameters: {//工具参数定义
                type: "object",//参数类型为对象
                properties: {
                    skill: { type: "string", "description": "skill名称(目录名或SKILL.md的frontmatter中的name)" },//参数属性为commandLine,字符串类型
                },
                required: ["skill"]//要想调用这个工具，必须传递path参数
            }
        }
    }
]
//定义变量，初始值为LOCAL_MODEL_TOOL_DEFINATIONS浅拷贝
let activeModelToolDefinitions = [...LOCAL_MODEL_TOOL_DEFINATIONS]
function refreshModelToolDefinitions(){
    //合并本地工具和MCP的工具
    activeModelToolDefinitions=[
        ...LOCAL_MODEL_TOOL_DEFINATIONS,//本地的内置工具
        ...getMcpOpenAiTools()//MCP服务器的工具列表
    ]
}
//将子进程stdout/stderr的Buffer输出解码为可读的字符串(windows中文环境一般为cp936)
function decodeResultBuffer(buffer) {
    if (!buffer || buffer.length == 0) return ""
    //如果是windows，则以cp936
    if (process.platform === 'win32') return iconv.decode(buffer, 'cp936')
    //其它 系统都用 UTF8
    return buffer.toString('utf8')
}

// 包含了会让开发环境长时间运行的命令字符串
const LONG_RUNNING_HINTS = [
    // "dev" 表示开发模式
    "dev",
    // "start" 表示启动服务
    "start",
    // "serve" 表示启动服务器
    "serve",
    // "server" 表示启动开发服务器
    "server",
    // "watch" 表示监听文件变更
    "watch",
    // "run server" 表示运行服务器
    "run server",
    // "runserver" 另一种写法，运行服务器
    "runserver",
    // "preview" 表示预览模式
    "preview",
    // "nodemon" 表示自动重启开发服务器
    "nodemon",
    // "uvicorn" 表示 Python asgi 服务器
    "uvicorn",
    // "gunicorn" 表示 Python wsgi 服务器
    "gunicorn",
    // "flask run" 表示 Flask 的运行命令
    "flask run",
    // "vite" 表示前端构建工具
    "vite",
    // "webpack" 表示前端构建工具
    "webpack",
    // "--watch" 表示监听参数
    "--watch",
    // "--hot" 表示热更新参数
    "--hot"
];
function looksLikeLongRunningCommand(commandLine) {
    //去除字符串收尾空格并且转小写格式化
    const normalized = commandLine.trim().toLowerCase()
    //在长时间运行命令关键字集合中查找，判断normalized是否任意一个关键字
    return LONG_RUNNING_HINTS.some(hint=>normalized.includes(hint))
}
//将标准输出和错误输出二个可读流绑定到缓冲区数组中
function bindStreamToBuffers(readableStream,buffers){
    //监听可读流的数据，当可读流有数据发射的时候，会把这个数据放在buffers里，就是说你在子进程中 console.log('world') process.stdout.write('hello')
    readableStream.on('data',(chunk)=>buffers.push(chunk))
    readableStream.on('end',(chunk)=>buffers.push(null))
}
//将bindStreamToBuffers收集到的buffers数组转成文本字符串
function buffersToText(buffers){
    const chunks = buffers.filter(chunk=>chunk!=null)
    if (!chunks.length)return ""
    return decodeResultBuffer(Buffer.concat(chunks))
}
//取文本末尾的指定行数，用于task_logs日志预览 
function tailTextLines(text,maxLines){
    if (!text)return ""
    return text.split(/\r?\n/).slice(-maxLines).join('\n')
}
//标记是否全部同意，默认是false
let alwaysApproveCommands=false
//定义审批函数，用于在执行shell命令前请求用户审批
function askCommandApproval(commandLine){
    //返回一个异步执行审批流程的Promise
    return new Promise((resolve)=>{
        //定义嵌套的提示词函数，用于在用户输入无效的时候递归调用
        const prompt = ()=>{
            console.log("\n[命令审批] 即将执行:")
            console.log(` ${commandLine}`)
            console.log("1) 本次同意")
            console.log("2) 以后全部同意")
            console.log("3) 拒接")
            rl.question("请选择[1/2/3]",(answer)=>{
                const choice = answer.trim()
                //如果用户选择1，表示只同意这一次的命令执行
                if(choice==="1"){
                    resolve({"approved":true})
                }else if(choice==="2"){
                    alwaysApproveCommands=true
                    console.log("已记住，后续命令将自动执行，不再询问")
                    resolve({"approved":true})
                }else if(choice==="3"){
                    resolve({"approved":false})
                }else{
                    console.log("无效输入，请输入1、2或3")
                    prompt()
                }
            })
        }
        prompt()

    })
}
class RunCommandLine {
    //检查并处理后台任务控制指令 比如task_list task_logs task_stop
    handleBackgroundTaskControlCommand(commandLine){
        //判断是否为task_list指令 不区分大小写，后面可带空格或行尾
        if (/^task_list(\s|$)/i.test(commandLine)){
            if (backgroundProcesses.size==0) return `当前没有已登记的后台任务`
            return [
                "[后台任务一览]",
                ...[...backgroundProcesses].map(([pid,meta])=>`- ${pid} ${meta.child.exitCode==null?"活动中":"已结束"} ${meta.commandLine}`)
            ].join('\n')
        }
        //匹配task_logs pid 指令 ，用于获取指定的后台进程的日志 task_logs  1000    
        const logsMatch = /^task_logs\s+(\d+)\s*$/i.exec(commandLine.trim())
        if(logsMatch){
            //从匹配的结果中获取PID进程ID这个数字
            const pid = Number.parseInt(logsMatch[1],10)
            if(!backgroundProcesses.has(pid)) return `未登记的后台PID：${pid}`
            //获取该PID对应的缓冲区buffers
            const {buffers}=backgroundProcesses.get(pid)
            //将缓冲区列表中的文件转为字符串文本，并截取末尾的若干行
            const  text = tailTextLines(buffersToText(buffers),CONFIG.backgroundLogPreviewLines)
            return `[PID ${pid}最近的输出]\n${text||(尚无输出)}`
        }
        //匹配task_stop pid 指令 ，用于终止指定进程ID的子进程  
        const stopMatch = /^task_stop\s+(\d+)\s*$/i.exec(commandLine.trim())
        if(stopMatch){
            //从匹配的结果中获取PID进程ID这个数字
            const pid = Number.parseInt(stopMatch[1],10)
            if(!backgroundProcesses.has(pid)) return `未登记的后台PID：${pid}`
            //获取该PID对应的子进程
            const {child}= backgroundProcesses.get(pid)
            try{
                //如果是windows系统的话，使用taskkill命令终止进程
                if (process.platform=='win32'){
                    spawnSync(`taskkill /PID ${pid}  \T \F`,{shell:true,stdio:"ignore"})
                }else{
                    //非windows则通过向进程组发送SIGTERM信号终止进程
                    process.kill(-pid,"SIGTERM")
                }
            }catch{
                //如果上面的kill都失败了，则直接向子进程对象调用kill方法
                child.kill("SIGTERM")
            }
            //从后台进程注册表中删除该pid
            backgroundProcesses.delete(pid)
            //返回中止进程的提示
            return `已请求终止后台进程 PID={pid}`
        }
        return null

    }
    //异步的方式运行commandLine命令，接收包含commandLine字段的对象参数
    async run({ commandLine }) {
        //尝试解析是否为后台任务控制指令(比如说task_list),如果是的话优先返回对应的回复
        const backgroundTaskControlReply =  this.handleBackgroundTaskControlCommand(commandLine)
        //如果解析出是控制后台任务的命令，则不再继续向下执行，直接返回结果 
        if (backgroundTaskControlReply!=null){
            return backgroundTaskControlReply
        }
        //如果不是总是自动批准的命令
        if(!alwaysApproveCommands){
            //异步请求用户对命令行命令进行批准
            const decision = await askCommandApproval(commandLine)
            //如果用户没有批准命令执行
            if(!decision.approved){
                return `用户已拒绝执行命令:${commandLine}`
            }
        }
        //判断命令行是否看起来像是一个长时间运行的命令
        if (looksLikeLongRunningCommand(commandLine)) {
            //调用异步非阻塞的方式运行commandLine这个shell命令
            return this.runBackgroundCommandLine(commandLine)
        } else {
            //调用同步阻塞的方式运行commandLine这个shell命令
            return this.runBlockingCommandLine(commandLine)
        }
    }
    async runBackgroundCommandLine(commandLine){
        //创建一个存储子进程输出的缓冲区数组
        const buffers = []
        //使用spawn启动一个新的子进程，传入命令行和配置对象
        const child = spawn(commandLine,{
            shell:true,
            cwd:WORKSPACE_ROOT,//指定子进程的工作目录为
            stdio:["ignore","pipe",'pipe']//配置子进程的标准输入为忽略，标准输出和错误输出重定向到管道中
        })
        //绑定子进程的标准输出流到buffers缓存区数组中
        bindStreamToBuffers(child.stdout,buffers)
        //绑定子进程的错误输出流到buffers缓存区数组中
        bindStreamToBuffers(child.stderr,buffers)
        //获取子进程的进程 ID
        const pid = child.pid
        //当启动后台任务的子进程的时候，把当前的子进程信息存储到backgroundProcesses映射中
        backgroundProcesses.set(
            pid,{
                commandLine,//记录启动该子进程使用的命令行字符串
                child,//记录子进程本身
                buffers//记录用于收集子进程输出的缓冲区buffer数组
            }
        )
        //监听了进程的退出事件，当子进程退出的时候将其从backgroundProcesses移除
        child.once('exit',()=>backgroundProcesses.delete(pid))
        //等待后台进行中初始化，延迟指定的时间(用于后台命令的启动和预热)
        await delay(CONFIG.backgroundWarmupMs)
        return `已经在后台成功启动了子进程\n PID:${pid}\n命令:${commandLine}\n 启动阶段输出:\n${Buffer.concat(buffers).toString('utf-8')||("尚未输出")}`
    }
    //同步运行commandLine命令，并返回命令执行结果 
    runBlockingCommandLine(commandLine) {
        //使用spawnSync同步执行commandLine命令
        const result = spawnSync(commandLine, {
            //指定使用shell运行commandLine
            shell: true,
            //指定工作目录为工作空间根目录
            cwd: WORKSPACE_ROOT,
            //输出二进制Buffer格式
            encoding: 'buffer',
            //最大缓冲区设置为10M
            maxBuffer: 10 * 1024 * 1024
        })
        // 如果命令执行超时，则返回超时提示
        if (result.error?.code === "ETIMEOUT") return "同步命令超时:{commandLine}"
        //如果有标准输出，则解码否则 返回空
        let merged = result.stdout?.length ? decodeResultBuffer(result.stdout) : "(stdout为空)"
        //如果有错误输出，则拼接错误输出到merged
        if (result.stderr?.length) {
            merged += `\n[stderr] \n ${decodeResultBuffer(result.stderr)}`
        }
        return result.status != 0 ? ` 退出码:${result.status}\n${merged}` : `命令正常完成\n${merged}`

    }
}
class ReadSkill{
    async run({skill:skillName}){
        const skill = getSkill(skillName)
        return skill?skill.body:`未找到Skill:{skillName}`
    }
}
//工具名称到对应的实例映射表
const toolHandlerByName = {
    //读取文件工具
    readFile: new ReadText(),
    //写入文件的工具
    writeFile: new WriteText(),
    //替换文件工具
    editFile: new EditFile(),
    //枚举目录工具
    listDir: new ListDir(),
    //枚举目录工具
    runCommand: new RunCommandLine(),
    //加载AgentSkill
    readSkill:new ReadSkill()
}

//定义一个askLine函数，返回一个Promise，用于异步获取用户输入
const askLine = () => new Promise((resolve) => {
    //向控制台输出普通的提示符，并等待用户的输入
    rl.question("> ", resolve)
})
//定义常量配置对象
const CONFIG = {
    //智能体允许的最大步数
    agentMaxSteps: 100,
    //后台进程预热时间 8s
    backgroundWarmupMs: 8000,
    //task_logs返回的最大行数
    backgroundLogPreviewLines:50
}
//实现一个异步延迟的delay函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
//定义异步函数，用于执行一次工具调用
async function executeSingleToolCall(toolCallPayload) {
    //获取本次工具调用的名称 writeFile
    const name = toolCallPayload.function.name
    let parsedArgs = {}
    try {
        parsedArgs = JSON.parse(toolCallPayload.function.arguments)
    } catch {
        parsedArgs = {}
    }
    console.log(`\n工具${name}被调用`)
    console.log(`工具入参:${JSON.stringify(parsedArgs, null, 2)}`)
    //声明用于存放工具调用结果的变量
    let textResult;
    //判断此工具是不是MCP服务器提供的工具
    if(isMcpTool(name)){
        //如果是的话，则尝试调用MCP服务器提供的工具
        textResult=await callMcpTool(name,parsedArgs)
    }else{
        //根据工具名称获取对应的处理器
        const handler = toolHandlerByName[name]
        //判断是否有对应的处理器，如果 有则执行处理器的run方法，如果没有未返回未实现这个工具
        textResult = handler ? await handler.run(parsedArgs) : `未实现的工具:${name}`
    }
    
    console.log(`返回:${textResult}`)
    //构建并返回本次工具调用的完整回复消息对象
    return {
        role: 'tool',//设置消息的角色为tool
        tool_call_id: toolCallPayload.id,//工具调用ID
        name,//工具名称
        content: textResult//工具返回的内容
    }
}
//定义一个异步函数，驱动智能体连续推理直到获得文件回复或超过最长步数为止
async function runAgentUntilReplyOrMaxSteps(messages) {
    //初始化步数计数器
    let step = 0
    console.log(activeModelToolDefinitions)
    //执行循环，直到步数超过最大限制
    while (step < CONFIG.agentMaxSteps) {
        //步数递增
        step++
        console.log(`\n 请求模型中...`)
        //向大模型的API发送消息请求回复
        const completion = await openaiClient.chat.completions.create({
            model: "deepseek-v4-pro",//模型名称
            "messages": messages,//消息列表
            tools: activeModelToolDefinitions,//传递给大模型的工具函数定义说明列表
            tool_choice: "auto"//工具的选择方法
        })
        //获取 模型返回的消息
        const assistantMessage = completion.choices[0].message
        //打印返回的消息
        console.log(JSON.stringify(assistantMessage, null, 2))
        //把助手消息添加到对话历史中
        messages.push(assistantMessage)
        // 获取本轮助手消息产生的工具调用
        const tool_calls = assistantMessage.tool_calls
        //判断是否有工具调用，如果无工具调用则直接返回助手回复
        if (!tool_calls || tool_calls.length == 0) {
            return assistantMessage
        }
        //判断是否存在命令执行，决定是否是顺序调用工具还是并行调用工具
        const sequential = tool_calls.some(tool_call=>tool_call.function.name === 'runCommand')
        let toolResponses=[];
        //如果需要串行顺序执行
        if(sequential){
            //依次按顺序执行工具调用，并将结果推入响应数组中
            for(const tool_call of tool_calls){
                const toolResponse = await executeSingleToolCall(tool_call)
                toolResponses.push(toolResponse)
            }
        }else{
            //否则并发执行所有的工具调用，并收集所有的结果
            toolResponses=await Promise.all(tool_calls.map(executeSingleToolCall))
        }
        //将所有的工具返回的消息添加到消息列表中
        for (const toolResponse of toolResponses) {
            messages.push(toolResponse)
        }
    }
    return {
        role: 'assistant',
        content: "对话步数已达上限"
    }

}

//定义异步主函数
async function main() {
    //创建工作区目录
    await fsp.mkdir(WORKSPACE_ROOT, { recursive: true })
    //异步加载所有的技能
    skills=await loadSkills()
    //根据基础的系统提示词，增强系统级别的说明，并赋值给agentSystemInstruction
    agentSystemInstruction = enrichSystem(AGENT_SYSTEM_INSTRUCTION_BASE)
    //当Claude启动的时候要尝试连接 MCP服务器
    try{
        //异步连接MCP服务器
        await connectMcpServer()
        //当成功连接到MCP服务器之后，要刷新工具列表
        refreshModelToolDefinitions()
    }catch(err){
        console.warn(`未成功连接MCP服务器:${err.message}`)
    }
    
    //无限循环，持续读取用户的输入
    for (; ;) {
       //创建一个消息列表，包含系统指令
        const messages = [{ "role": "system", "content": agentSystemInstruction }]
        //等待用户输入完成一行的内容
        const line = await askLine()
        //如果用户输入的内容为空，也就是说只包含空白的话，则跳过本次循环
        if (!line.trim()) continue;
        //如果用户输入内容为q或者quit ,则跳出循环，结束程序
        if (line.trim() == "q") break;
        //尝试解析用户输入的斜杠命令
        const slash = parseSlash(line)
        //判断是否为斜杠命令，生成相应在的用户内容，否则 采取原始输入
        const userContent = slash?`请按Skill/${slash.skill.name}执行：\n\n ${slash.skill.body}`+(
            slash.args?`\n\n用户补充:${slash.args}`:''
        ):line
        console.log('userContent',userContent)
        ///btw的消息不往上下文窗口也不是messages列表里放
        //将用户输入内容加入到对话消息列表中
        messages.push({ "role": "user", "content": userContent })
        //调用OPENAI的API，发送消息获取回复
        const reply = await runAgentUntilReplyOrMaxSteps(messages)
        if (reply) {
            console.log(`\nAssistant:\n ${reply.content}`)
        }

    }
    rl.close()
    //在关闭claude的时候也关闭与MCp服务器的连接
    await closeMcpConnection().catch(()=>{})
}
main().catch(async (err)=>{
    console.error(err)
     await closeMcpConnection().catch(()=>{})
     process.exit(1)
})