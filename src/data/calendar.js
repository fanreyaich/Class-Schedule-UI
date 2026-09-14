/* 聚合模块：由三个可维护数据文件组装，通常不需要直接修改。 */
globalThis.CAMPUS_CALENDAR={
  ...TIMETABLE_TIMES,
  ...HOLIDAY_CALENDAR,
  pendingNote:HOLIDAY_CALENDAR.note,
  cancelledDates:TIMETABLE_DATA.cancelledDates,
  extraLessons:TIMETABLE_DATA.extraLessons
};
