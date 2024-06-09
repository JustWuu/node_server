//把傳入的毫秒轉成年月日時
export function convertDate(date: any) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month =
    d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate()
  const hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours()
  const mm = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
  const ss = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
  return year + "-" + month + "-" + day + " " + hh + ":" + mm + ":" + ss
}
export function getYear() {
  const d = new Date()
  const year = d.getFullYear()
  return `${year}`
}

export function toYear(date: string) {
  const d = new Date(date)
  const year = d.getFullYear()
  return `${year}`
}

export function getSeason() {
  let season = ""
  const d = new Date()
  const month = d.getMonth() + 1
  switch (month) {
    case 1:
    case 2:
    case 3:
      season = "winter"
      break
    case 4:
    case 5:
    case 6:
      season = "spring"
      break
    case 7:
    case 8:
    case 9:
      season = "summer"
      break
    case 10:
    case 11:
    case 12:
      season = "autumn"
      break
  }
  return season
}

/**
 *
 * @param dateString 原始日期'2024-05-08'
 * @param monthsToAdd 增加的月數
 * @returns
 */
export function addMonthsToDate(dateString: string, monthsToAdd: number) {
  // 將日期字串轉換成 Date 物件
  const date = new Date(dateString)
  // 增加月份
  date.setMonth(date.getMonth() + monthsToAdd)
  // 取得新日期的年、月、日
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  // 回傳 yyyy-mm-dd 格式的新日期字串
  return `${year}-${month}-${day}`
}
