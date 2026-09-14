# 课表空白模板维护指南

## 先看这三个数据模块

日常维护只编辑以下三个文件；页面、引擎和离线输出都不需要手动修改。

| 模块 | 文件 | 负责内容 |
| --- | --- | --- |
| 课表数据 | `src/data/schedule.js` | 学期、课程、每周排课、学校停补课例外 |
| 上课时间数据 | `src/data/times.js` | 每节课的起止时间、午间区间、课间判定时间 |
| 节假日数据 | `src/data/holidays.js` | 国务院节假日、调休上班日、官方来源 |

`src/data/calendar.js` 只负责把三类数据交给页面使用，请不要作为日常配置入口。所有页面及离线打包会按“课表 → 上课时间 → 节假日 → 汇总”的顺序加载它们。

## 1. 维护课表数据

在 `src/data/schedule.js` 填写 `semester`：`startDate` 是第一教学周的周一，格式为 `YYYY-MM-DD`；`totalWeeks` 是教学周数，允许 1 至 60。

`courses` 中每门课程需有唯一的 `id`、`name` 和 `color`。`rules` 中每条排课要引用已有的 `courseId`，并填写 `weekday`（1 为周一，7 为周日）、`startPeriod`、`endPeriod`、`weeks`、`room`、`teacher`。

```js
courses: [
  {id:"DEMO001",name:"示例课程",color:"#c96442"}
],
rules: [
  {courseId:"DEMO001",weekday:1,startPeriod:1,endPeriod:2,weeks:[1,2],room:"示例教室",teacher:"示例教师"}
]
```

节次必须存在于 `times.js` 的 `common` 中；周次不可超出 `totalWeeks`，也不要重复。系统按已经结束的节次统计课时；只有时间连续、课程/地点/教师相同的节次才会合并显示为连堂。

如需标记学校校历的临时变化，使用同一文件中的两个数组：

```js
cancelledDates:["2030-01-07"],
extraLessons:[
  {courseId:"DEMO001",week:1,weekday:6,startPeriod:1,endPeriod:2,date:"2030-01-12",room:"示例教室",teacher:"示例教师"}
]
```

`cancelledDates` 仅取消该日所有已排课程；`extraLessons` 用于补课或临时加课，字段与 `rules` 相同，并额外填写实际 `date`。两者都应以学校校历或教学通知为准。

## 2. 维护上课时间数据

在 `src/data/times.js` 的 `common` 里维护节次。每项都是 `["开始时间","结束时间"]`，统一使用 24 小时制 `HH:MM`，并确保开始时间早于结束时间。

```js
common:{
  1:["08:00","08:45"],
  2:["08:55","09:40"]
}
```

新增晚课时，先在这里增加节次，再在 `schedule.js` 中引用对应节号。`lunch` 是午间状态的开始和结束时间；`breakMinutes` 是两节课之间被标为“课间”的最大间隔分钟数，不会改变任何课程的实际时间。

## 3. 维护节假日数据

在 `src/data/holidays.js` 中维护。每个假期用 `name`、`start`、`end` 表示，日期一律为 `YYYY-MM-DD`；跨多天只写一条记录。

```js
holidays:[
  {name:"示例假期",start:"2030-05-01",end:"2030-05-03"}
],
workdays:["2030-05-04"]
```

当前文件已写入国务院办公厅公布的 2026 年安排。每年发布新通知后，替换整个 `holidays` 与 `workdays` 数组，并更新 `source` 和 `note`。`workdays` 用于日历展示；它不会自动新增课程。若调休日需要上课，请同时在 `schedule.js` 用 `extraLessons` 明确添加补课。

法定节假日只作提醒，学校停课、补课及考试安排仍以学校校历为准。

## 修改后的检查与打包

1. 检查三个数据文件的逗号、引号和日期格式。
2. 打开 `index.html`，确认首页、经典课表和学期总览的排课正确。
3. 运行 `node scripts/build-offline.cjs`，生成 `outputs/课表空白模板_离线Demo.html`。
4. 如本机已具备浏览器验收环境，运行 `node scripts/verify-browser.cjs`。
5. 只分发 `outputs` 中重新生成的 HTML；不要直接编辑该单文件。

## 公开发布前

核对 `courses`、`rules`、`cancelledDates`、`extraLessons` 中没有不应公开的课程、人员、地点或校历信息。浏览器里的自定义状态仅保存在当前设备，不写进 HTML，也不会同步到其他设备。
