# 课表空白模板 · 离线 Demo

一个可在电脑、手机浏览器和 Android App 中使用的离线课表看板。默认不含学校、班级、课程、教师、教室或个人日历；课表、作息和节假日数据可分别维护。

> 推荐方式：先克隆本仓库，再将课表资料和修改目标交给 AI Agent 维护。Agent 可以按本 README 的数据边界完成编辑、检查、重新生成离线 HTML；你只需验收结果。

## 使用环境与打开方式

| 目的 | 需要的环境 | 是否需要网络或命令 |
| --- | --- | --- |
| 只运行课表 | 电脑或手机的现代浏览器，例如 Edge、Chrome、Safari | 不需要网络，不需要 Node.js，不需要命令 |
| 手动修改课表 | 文本编辑器，例如记事本、VS Code 或任意代码编辑器 | 修改后可直接打开 `index.html` 预览 |
| 生成可传手机的单文件 | 电脑安装 Node.js LTS | 只需本地运行一条命令；不安装 npm 依赖，不需要服务器 |
| 打包 Android App | Android 手机安装 WebToApp | 将已经生成的单文件导入，不需要部署网页 |

### 电脑端：无需命令直接打开

1. 打开项目中的 `outputs` 文件夹。
2. 双击 `课表空白模板_离线Demo.html`。
3. 如果系统询问打开方式，选择 Edge、Chrome 或其他现代浏览器，并可勾选“始终使用此应用”。
4. 页面会直接在浏览器中打开；断网也能使用。修改浏览器中的自定义状态只保存在这台电脑。

若是在修改源文件后临时预览，不需要生成单文件：直接双击项目根目录的 `index.html` 即可。只有要传手机、分享给别人或导入 WebToApp 时，才需要重新生成 `outputs` 的单文件。

### 制作与修改环境

本项目是原生 HTML、CSS 和 JavaScript，没有 npm 包、数据库、服务器或开发启动命令。编辑器只要能保存 UTF-8 文本即可；推荐 Windows 电脑搭配 VS Code 或其他代码编辑器。Node.js 仅用于把多个源文件汇总为一个离线 HTML，不参与日常打开和运行。

## 先选一种使用方式

| 场景 | 打开或使用的文件 |
| --- | --- |
| 电脑或手机浏览器 | [`outputs/课表空白模板_离线Demo.html`](outputs/课表空白模板_离线Demo.html) |
| 修改课表后预览 | `index.html` |
| Android 安装版 | 将 `outputs/课表空白模板_离线Demo.html` 作为本地 HTML 资源，用 [WebToApp](https://github.com/shiaho777/web-to-app) 打包 |

## 快速开始

### 路线 A：交给 AI Agent 维护（推荐）

1. 在电脑终端克隆仓库；二选一即可：

   ```powershell
   git clone https://github.com/fanreyaich/Class-Schedule-UI.git
   ```

   或：

   ```powershell
   git clone https://gitee.com/fanreyaich/Class-Schedule-UI.git
   ```

2. 将克隆后的 `Class-Schedule-UI` 文件夹交给你的 AI 编码 Agent，并附上要更新的课表、作息或节假日资料。
3. 直接对 Agent 说：`请先阅读 README 的“给 Agent 阅读：工作指南”和 docs/MAINTENANCE.md；按资料更新课表，生成离线 HTML，并告诉我输出文件路径。`
4. Agent 应只修改对应的数据模块、检查数据、运行打包，然后交付 `outputs/课表空白模板_离线Demo.html`。
5. 你在电脑上双击该 HTML 验收；满意后再让 Agent 提交或推送。除非你明确授权，Agent 不应发布、推送或将个人课表公开。

### 路线 B：人工填写

1. 先复制或下载 `outputs/课表空白模板_离线Demo.html`；双击即可使用空白课表。
2. 要填写自己的课表时，编辑 `schedule.js`、`times.js` 和 `holidays.js` 三个数据文件。
3. 在电脑上直接双击 `index.html` 检查修改后的效果。
4. 确认无误后，按下方第 5 步生成新的离线单文件。
5. 生成新的离线单文件：

   - 首次使用时，到 [Node.js 官网](https://nodejs.org/) 安装 **LTS** 版本，默认选项安装即可；安装后重新打开终端。
   - 进入项目文件夹。最简单的方法是在该文件夹空白处按住 `Shift` 右键，选择“在终端中打开”或“在此处打开 PowerShell”。
   - 输入以下命令并按回车：

     ```powershell
     node scripts/build-offline.cjs
     ```

   - 看到 `已生成 outputs/课表空白模板_离线Demo.html` 即表示成功；使用或发送这个新文件，而不是旧文件。
   - 若看到“node 不是内部或外部命令”，说明 Node.js 未安装完成或终端未重开；安装/重开后再执行。该步骤不联网、不安装额外依赖。

## 给人阅读：手动填写规则

不要手动编辑 `outputs` 里的单文件。它是由源文件自动汇总生成的，下一次打包会覆盖它。

### 只改这三个数据模块

| 文件 | 你在这里填写什么 | 不要在这里填写什么 |
| --- | --- | --- |
| [`src/data/schedule.js`](src/data/schedule.js) | 学期、课程、每周排课、停课、补课 | 每节课钟点、法定节假日 |
| [`src/data/times.js`](src/data/times.js) | 各节的上课/下课时间、午间与课间规则 | 课程名称、教学周 |
| [`src/data/holidays.js`](src/data/holidays.js) | 法定节假日、调休工作日、官方通知链接 | 学校的补课安排 |

`src/data/calendar.js` 会自动汇总上述内容，通常不用修改。

### 填课表的规则

在 `schedule.js` 中，`startDate` 必须是第一教学周的周一，格式为 `YYYY-MM-DD`；`totalWeeks` 为 1 到 60 的整数。

每门课程先写进 `courses`，再在 `rules` 排课。课程 `id` 必须唯一；每条排课的 `courseId` 必须对应已有课程。`weekday` 用 1 至 7 表示周一至周日；`startPeriod` 和 `endPeriod` 必须是 `times.js` 中存在的节次；`weeks` 不得超出教学周范围或重复。

```js
courses: [
  {id:"DEMO001",name:"示例课程",color:"#c96442"}
],
rules: [
  {courseId:"DEMO001",weekday:1,startPeriod:1,endPeriod:2,weeks:[1,2],room:"示例教室",teacher:"示例教师"}
]
```

学校临时停课使用 `cancelledDates:["YYYY-MM-DD"]`；补课使用 `extraLessons`，其字段与 `rules` 相同，另加实际 `date`。调休日只会在日历中展示，**不会自动生成课程**；确需上课时，请明确写入 `extraLessons`。

### 填上课时间的规则

`times.js` 的每个节次采用 `["HH:MM","HH:MM"]` 格式，统一 24 小时制，开始时间必须早于结束时间。新增晚课时，先新增节次，再在课表规则中引用该节号。

`lunch` 只决定页面何时显示“午间”；`breakMinutes` 只决定两课之间多长间隔仍显示“课间”，两者不会改变课程实际时间。

### 填节假日的规则

每个假期以 `{name,start,end}` 表示，日期均为 `YYYY-MM-DD`，跨多天只写一项。当前 `holidays.js` 已写入国务院办公厅公布的 2026 年安排；新年度通知发布后，整体更新 `holidays`、`workdays`、`source` 和 `note`。

法定节假日只作提示。学校停课、补课、考试或特殊教学安排，应以学校校历和通知为准。

完整字段说明见 [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md)。

## 电脑端使用

### 直接使用

双击 `outputs/课表空白模板_离线Demo.html`，选择任意现代浏览器打开即可。浏览器中的自定义状态保存在本机；清理浏览器站点数据后会消失，不会同步到其他设备。

### 编辑后生成单文件

安装 Node.js 后，在项目根目录运行：

```bash
node scripts/build-offline.cjs
```

然后将 `outputs/课表空白模板_离线Demo.html` 发给其他设备即可。可选验收命令：

```bash
node scripts/verify-browser.cjs
```

第二条命令需要本机已配置 Playwright 和 Edge；不能运行时不影响正常打开或打包。

## 手机端使用

### 浏览器直接打开

1. 把 `outputs/课表空白模板_离线Demo.html` 传到手机。
2. 在文件管理器中点开该文件，选择浏览器打开。
3. 建议在浏览器菜单中添加到主屏幕，便于像应用一样进入。

页面已适配手机安全区域；沉浸模式和进度全屏适合竖屏使用。

### 用 WebToApp 打包为 Android App

本项目推荐使用 [WebToApp](https://github.com/shiaho777/web-to-app) 的 **HTML** 类型：它会将本地静态文件打入 APK，不需要远程网址。

1. 在电脑生成最新的 `outputs/课表空白模板_离线Demo.html`，传到手机。
2. 在手机新建一个文件夹，例如 `课表App`，将该单文件放入并命名为 `index.html`。它仍是同一份已汇总的离线 HTML。
3. 在 WebToApp 点“创建”，选择 **HTML**，导入该文件夹或含 `index.html` 的 ZIP。
4. 确认入口文件为 `index.html`；启用 JavaScript 和本地存储。离线单文件可使用文件加载模式，或按 WebToApp 的默认自动模式。
5. 填写应用名称、图标和包名；如希望更像原生应用，可隐藏浏览器工具栏。
6. 先预览，再从应用菜单选择“构建 APK”，安装生成的 APK。

以后更新课表时，仍在电脑修改三类数据并重新生成单文件；将新文件替换到 WebToApp 项目后重新构建 APK。若要覆盖安装旧 App，请在 WebToApp 中递增版本号。

WebToApp 的 HTML 项目支持本地 HTML/CSS/JS 文件、默认 `index.html` 入口、JavaScript 与本地存储配置；详见其 [HTML 使用说明](https://shiaho777.github.io/web-to-app/zh/guide/app-types/html) 和 [快速开始](https://shiaho777.github.io/web-to-app/zh/guide/getting-started)。

## 给 Agent 阅读：工作指南

### 修改范围与优先级

1. 用户要求更新课表时，优先只编辑 `src/data/schedule.js`。
2. 用户要求调整节次、上下课时间、午间或课间判定时，只编辑 `src/data/times.js`。
3. 用户要求更新法定节假日或调休时，只编辑 `src/data/holidays.js`；必须以官方政府通知为依据，并同步更新 `source`、`note`。
4. `src/data/calendar.js` 为聚合层。除非变更数据结构，不修改它。
5. 只有用户明确要求样式、布局或功能时，才修改 `src/app.js`、样式和页面文件。

### 数据变更规则

- 不得从截图、历史页面、浏览器缓存或猜测中编造课程、人员、教室、校区、学期日期或补课安排；缺少权威来源时应保留空白或向用户说明。
- 保留用户已有数据；不要以“空白模板”为由删除用户后来填入的内容。
- 改排课前检查课程 ID、周次、星期、节次、日期格式与时间顺序。
- 改动 `times.js` 后，检查所有 `rules` 与 `extraLessons` 引用的节次仍存在。
- 节假日与补课是两套数据：`workdays` 不等于课程；需要补课时添加 `extraLessons`。
- 公开前扫描课程、教师、教室、校区、学号、个人路径、截图、原始 Excel/Word/PDF 和浏览器配置，避免将个人数据提交或打包。

### 必经验证与交付

1. 检查改动文件的语法与数据一致性。
2. 运行 `node scripts/build-offline.cjs`；只交付新生成的 `outputs/课表空白模板_离线Demo.html`。
3. 有浏览器验收环境时运行 `node scripts/verify-browser.cjs`。
4. 说明本次改动涉及的模块、数据来源和输出路径。
5. 仅在用户明确要求时执行 `git commit`、`git push`、发布网站或构建/分发 APK；任何外部发布前再次确认脱敏范围。

## 页面一览

| 页面 | 用途 |
| --- | --- |
| 首页 | 当前日期、教学周、时间段与下一节课入口 |
| 进度看板 | 整体、课程、周次与学期进度；今日安排、空闲时间与节假日 |
| 经典课表 | 周一至周日的传统节次课表 |
| 学期总览 | 覆盖全部教学周的长课表 |
| 沉浸模式 | 上课、休息、午间、节假日或自定义状态的计时页面 |
| 进度全屏 | 无时钟的沉浸式进度展示，含五种可切换视觉效果 |

## 项目结构与隐私

```text
src/data/       三类可维护数据
src/            页面逻辑、样式与进度视觉效果
docs/           人类维护说明
outputs/        可单独分享、可用于 APK 打包的离线 HTML
scripts/        离线打包与浏览器验收脚本
```

公开前请检查 `courses`、`rules`、`cancelledDates`、`extraLessons` 是否含有不应公开的课程、人员、地点或校历信息。不要把截图、浏览器配置、密钥、原始课表或个人路径加入仓库。
