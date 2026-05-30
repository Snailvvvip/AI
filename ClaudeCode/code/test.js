const path = require('path')
const fsp = require('fs/promises')
const os = require('os')
const matter = require('gray-matter')
const root =  path.join(process.cwd(),'.claude','skills')

//接收原始文件内容字符串
function parseFrontmatter(raw){
    //解析源文件内容，提取出data（YAML属性）和content(正文内容)
   const {data,content} =  matter(raw)
   return {
    meta:data,
    body:content.trim()
   }
}

async function main(){
    entry=''
    const raw = await fsp.readFile(path.join(root,"commit-message",'SKILL.md'),'utf-8')
    const {meta,body} = parseFrontmatter(raw)
    const name = (meta.name||entry.name).trim()
    console.log(name)
     console.log(meta,body)
}
main()