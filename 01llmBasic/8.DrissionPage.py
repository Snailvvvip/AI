from DrissionPage import ChromiumPage, SessionPage, ChromiumOptions
import time
import os
import requests

# 如果你报错说找不到Chrome，那就 r = raw,让\保持原始的含义，不要代表转义
# 在 Chrome 地址栏输入 chrome://version，复制「可执行文件」路径后执行：
ChromiumOptions().set_browser_path(
    r"C:\Program Files\Google\Chrome\Application\chrome.exe"
).save()
# 说明：创建浏览器页面对象
page = ChromiumPage()
page.get("https://static.docs-hub.com/8_1750232305740.html")
imgs = page.eles("tag:img")
os.makedirs("imgs", exist_ok=True)
for img in imgs:
    url = img.attr("src")
    filename = os.path.join("imgs", os.path.basename(url))
    resp = requests.get(url)
    with open(filename, "wb") as f:
        f.write(resp.content)


"""
# 说明：创建浏览器页面对象
page = ChromiumPage()

# 说明：新建标签页并打开百度，返回标签对象
tab_baidu = page.new_tab("https://www.baidu.com")

# 说明：再新建标签页并打开网易
tab_163 = page.new_tab("https://www.163.com")

# 说明：等待 1 秒，确保页面加载
time.sleep(1)

# 说明：切换回百度标签页
page.activate_tab(tab_baidu.tab_id)

# 说明：打印当前标签页标题
print(page.title)


page = ChromiumPage()
page.get("https://static.docs-hub.com/a_1783080368749.html")
links = page.eles("tag:a")
# 遍历每个链接，带你文本和href属性
for link in links:
    print(link.text, link.attr("href"))

print(links.get.texts())


page = ChromiumPage()
page.get("https://gitee.com/login")
page.ele("#user_login").input("your username")
page.ele("#user_password").input("your password")
page.ele("@name=commit").click()


# 等待页面加载完成
page._wait_loaded()
container = page.ele("tag:div@class:explore-repo__list", timeout=10)
titles = container.eles("tag:a@class:title")
for t in titles:
    print(t.text)


page = ChromiumPage()
page.get("https://static.docs-hub.com/ysczdjbyf_1750214922342.html")
# ID选择器
div1 = page.ele("#one")
# 属性选择器 精确匹配属性
p1 = page.ele("@name=row1")
# 属性选择器 模糊匹配属性
p1 = page.ele("@name:row1")
# 用文本模糊匹配包括 第二个div的元素
div2 = page.ele("第二个div")
# 返回页面中所有标签名为div的元互
all_divs = page.eles("tag:div")
# 在div1内部查找所有的p标签
p_list = div1.eles("tag:p")
# 获取div1下一个同级兄弟元素
next_div = div1.next()
print(div1, p1, div2, all_divs, p_list, next_div)
# xpath:/html/body/div[2]
# css:

page = ChromiumPage()


page.get("https://www.baidu.com")
# 定位ID为chat-textarea的元素，找到后向这个输入框中输入文字 iPhone
page.ele("#chat-textarea").input("iPhone")
# 定位到百度一下的按钮，点击它进行搜索
page.ele("#chat-submit-button").click()
"""
