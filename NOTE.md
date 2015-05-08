第 1 章 Node.js 简介
CommonJS 规范包括了模块(modules)、包(packages)、系统(system)、二进制(binary)、 控制台(console)、编码(encodings)、文件系统(filesystems)、套接字(sockets)、单元测 试(unit testing)等部分。
  package.json 必须在包的顶层目录下;  二进制文件应该在 bin 目录下;
  JavaScript 代码应该在 lib 目录下;
  文档应该在 doc 目录下;
  单元测试应该在 test 目录下。

第 2 章 安装和配置 Node.js
POSIX 系统

第 3 章 Node.js 快速入门
node -e "console.log('Hello World');"
REPL (Read-eval-print loop),即输入—求值—输出循环。
supervisor

package.json 是 CommonJS 规定的用来描述包的文件,完全符合规范的 package.json 文 件应该含有以下字段。
  name:包的名称,必须是唯一的,由小写英文字母、数字和下划线组成,不能包含 空格。
  description:包的简要说明。
  version:符合语义化版本识别1规范的版本字符串。
  keywords:关键字数组,通常用于搜索。
  maintainers:维护者数组,每个元素要包含 name、email (可选)、web (可选)字段。
  contributors:贡献者数组,格式与maintainers相同。包的作者应该是贡献者数组的第一个元素。
  bugs:提交bug的地址,可以是网址或者电子邮件地址。
  licenses:许可证数组,每个元素要包含 type (许可证的名称)和 url (链接到许可证文本的地址)字段。
  repositories:仓库托管地址数组,每个元素要包含 type(仓库的类型,如 git )、url (仓库的地址)和 path (相对于仓库的路径,可选)字段。
  dependencies:包的依赖,一个关联数组,由包名称和版本号组成。

npm link express 创建全局链接
npm init 包的发布
npm publish/npm unpublish

node debug *.js 命令行调试
node --debug-brk debug.js //在一个终端中
node debug 127.0.0.1:5858 //在另一个终端中

node --debug-brk=5858 debug.js -> node-inspector -> http://127.0.0.1:8080/debug?port=5858

第 4 章 Node.js 核心模块
global
process
node argv.js 1991 name=byvoid --v "Carbo Kuo"
console.trace()
util.inspect 将任意对象转换 为字符串

文件权限指的是 POSIX 操作系统中对文件读取和访问权限的规范,通常用一个八进制数来表示。例如 0754 表 示文件所有者的权限是 7 (读、写、执行),同组的用户权限是 5 (读、执行),其他用户的权限是 4 (读), 写成字符表示就是 -rwxr-xr--。

第 5 章 使用 Node.js 进行 Web 开发
模板引擎(Template Engine)
ejs 的标签系统非常简单,它只有以下3种标签。
  <% code %>:JavaScript 代码。
  <%= code %>:显示替换过 HTML 特殊字符的内容。
  <%- code %>:显示原始 HTML 内容。

req.body 就是 POST 请求信息解析过后的对象，如req.body['password']
req.flash 是 Express 提供的一个奇妙的工具,通过它保存的变量只会在用户当前 和下一次的请求中被访问,之后会被清除,通过它我们可以很方便地实现页面的通知
和错误信息显示功能。
res.redirect 是重定向功能,通过它会向用户返回一个 303 See Other 状态,通知
浏览器转向相应页面。
crypto 是 Node.js 的一个核心模块,功能是加密并生成各种散列。

第 6 章 Node.js 进阶话题
Node.js 是根据实际文 件名缓存的,而不是 require() 提供的参数缓存的。
数组的 forEach 方法解决循环的陷阱。
解决控制流难题：async、streamlinejs和jscex、eventproxy。
node app.js几个重大缺陷：
  不支持故障恢复、没有日志、无法利用多核提高性能、独占端口、需要手动启动
Node.js 更善于处理那些逻辑简单但访问频繁的任务。
Node.js 不适合做的事情：
  1. 计算密集型的程序
  2. 单用户多任务型应用
  3. 逻辑十分复杂的事务
  4. Unicode 与国际化

