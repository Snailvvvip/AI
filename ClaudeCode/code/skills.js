const path = require('path')
const fsp = require('fs/promises')
const os = require('os')
//用于解析SKILL.md文件的
const matter = require('gray-matter')
const { describe } = require('zod/v4/core')
//定义技能存放目录，既有当前目录下面的的.calude/skills,也有用户目录下的.claude/skills
const SKILL_DIRS = [
    path.join(process.cwd(),'.claude','skills'),
    path.join(os.homedir(),'.claude','skills')
]
//创建MAP用于存储技能
const skills = new Map()
//接收原始文件内容字符串
function parseFrontmatter(raw){
    //解析源文件内容，提取出data（YAML属性）和content(正文内容)
   const {data,content} =  matter(raw)
   return {
    meta:data,
    body:content.trim()
   }
}
//描述skills目录里所有的skill
async function scanDir(root){
    //读取目录下面所有的文件和文件夹
    let entries = await fsp.readdir(root,{withFileTypes:true})
    //遍历所有的项目
    for (const entry of entries){
        //如果不是目录则跳过，只处理目录
        if(!entry.isDirectory()) continue
        const raw = await fsp.readFile(path.join(root,entry.name,'SKILL.md'),'utf-8')
        //解析SKILL.md文件，获取meta元数据和正文body
        const {meta,body} = parseFrontmatter(raw)
        //技能名称优先取meta.name,如果没有使用目录名
        const name = (meta.name||entry.name).trim()
        //将技能信息保存到skills 这个MAP中
        skills.set(
            name,//技能名
            {
                name,//技能名
                description:meta.description||name,//技能描述
                body//技能正文
            }
        )
    }
}
//加载所有的技能 
async function loadSkills(){
    //清空已有的技能 
    skills.clear()
    //遍历技能目录列表，逐个扫描
    for (const dir of SKILL_DIRS) await scanDir(dir)
    //返回所有的技能的数组
    return [...skills.values()]
}
function enrichSystem(base){
    //如果没有任何技能，则返回原始字符串
    if (!skills.size)return base
    const lines = [
        ...skills.values().map(skill=>`- ${skill.name}: ${skill.description}`)
    ]
    return base +"\n\nSkills(匹配时用readSkill加载正文):\n"+lines.join('\n')
}
//根据技能名称获取对应的技能对象  /commit-message 也有可能是/commit-message 
function getSkill(name){
    //去掉name开头的或能存在的/,然后到Map中找对应的对象
    return skills.get(String(name||"").replace(/^\//,"").trim())||null
}
//输入类似于    /commit-message  只写标题，用feat前缀 
function parseSlash(line){
    const t = line.trim()
    //如果不是以/开头，直接返回null
    if(!t.startsWith('/'))return null
    const rest = t.slice(1)//   commit-message  只写标题，用feat前缀 
    //查找第一个空格
    const sp = rest.indexOf(' ')
    //cmd  commit-message
    const cmd = (sp ==-1?rest:rest.slice(0,sp)).trim()
    //查找这个skill对应的对象
    const skill = getSkill(cmd)
    if (!skill) return null
    return {
        skill,//skill对象
        args:sp==-1?"":rest.slice(sp+1).trim()//额外信息
    }
}
module.exports = {
    loadSkills,
    enrichSystem,
    parseSlash,
    getSkill
}