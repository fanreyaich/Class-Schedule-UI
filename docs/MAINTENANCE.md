# 空白模板维护指南

## 默认内容

课程和规则为空；学期日期未设置，周数默认为18；作息是8节45分钟的通用示例。
没有预置真实学校、教学班、姓名、教室、课程及个人日历。节假日列表同样为空。
页面里的日期和时钟为设备当前北京时间，不代表排课日期。

## 填写课程

在src/data/schedule.js中配置semester.startDate（第一教学周的周一，YYYY-MM-DD）及totalWeeks。
向courses添加课程对象，向rules添加排课规则。例如以下为纯虚构格式示例：

courses: [{id:"DEMO001",name:"示例课程",color:"#c96442"}]
rules: [{courseId:"DEMO001",weekday:1,startPeriod:1,endPeriod:2,weeks:[1,2],room:"示例教室",teacher:"示例教师"}]

ID必须唯一；weekday是1至7；weeks在学期范围内且不能重复。节次必须存在于calendar.js的common配置。
每项作息单独决定上下课时间；此模板没有内置任何校区、楼宇特殊规则。
计算按已结束节次统计课时，连堂只合并实际时间连续的同课程同地点区间。

## 演示

打开沉浸模式，点击“体验10分钟计时”，可在空白课表中预览计时效果。
点击“进度全屏”选择墨水圆池、东升西落、晨昏、沙漏或轨道行星。
演示状态是浏览器本地的临时状态，不添加课程记录，倒计时到期恢复空白状态。
“恢复自动状态”可以提前清除。设置使用独立存储名称，不读取其他项目的浏览器设置。

## 打包与本地Git

使用Node.js运行 node scripts/build-offline.cjs。输出outputs/课表空白模板_离线Demo.html可以单独分发。
开发时保持模块结构；不要手动修改自动生成的HTML。
修改后先检查数据、运行验收、重新打包，再git add与git commit。
仓库仅在本地；没有远程地址，没有执行推送或网站发布。

## 公开前核对

确认courses/rules/holidays/cancelledDates/extraLessons均为空，学期日期未设置。
不要把真实资料、截图、浏览器配置、密钥或个人路径加入仓库。artifacts及常见原始文档扩展名已忽略。
空白发布文件不带浏览器localStorage，但接收者设备上自行设置的状态不会跨设备同步。
