import moment from "moment-timezone"

class Time {
  constructor() {}
  /**
   * 回傳毫秒
   */
  time(): number {
    const timeZone = process.env.TIME_ZONE!
    const date = moment.tz(new Date(), timeZone).valueOf()
    return date
  }
  /**
   * 回傳YYYY-MM-DD HH:mm:ss
   */
  date(): string {
    const timeZone = process.env.TIME_ZONE!
    const date = moment.tz(new Date(), timeZone).format("YYYY-MM-DD HH:mm")
    return date
  }
  /**
   * 把傳入的毫秒轉成年月日
   */
  convertDate(date: any) {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    const month =
      d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1
    const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate()
    return year + "-" + month + "-" + day
  }
  /**
   * 把傳入的毫秒轉成時
   * @param date - 傳入的毫秒數
   * @param isUTC - 是否維持+0時區
   * @returns 格式化後的時間字符串
   */
  convertTime(date: any, isUTC = false) {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const hh = isUTC ? d.getUTCHours() : d.getHours()
    const mm = isUTC ? d.getUTCMinutes() : d.getMinutes()
    const formattedHH = hh < 10 ? "0" + hh : hh
    const formattedMM = mm < 10 ? "0" + mm : mm
    return formattedHH + ":" + formattedMM
  }
  /**
   * 把傳入的毫秒轉成年月日時
   */
  convertDateTime(date: any) {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    const month =
      d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1
    const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate()
    const hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours()
    const mm = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
    return year + "-" + month + "-" + day + " " + hh + ":" + mm
  }
  /**
   * 把傳入的毫秒轉成年月日時
   */
  convertStartEnd(date: any, type: "start" | "end") {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const pad = (num: any) => num.toString().padStart(2, "0")
    const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    if (type === "start") {
      return `${formattedDate}T00:00:00`
    } else if (type === "end") {
      return `${formattedDate}T23:59:59`
    }
  }
  /**
   * 取得當月最小至最大日
   */
  getThisMonthRange(): [Date, Date] {
    const d = new Date()
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)

    return [start, end]
  }
  /**
   * 取得今天或至今最小至最大日
   * @param offset - 傳入1，代表開始日回推一年，以此類推
   * @returns [最小日, 最大日]
   */
  getThisDateRange(offset: number | 0): [Date, Date] {
    const now = new Date()
    let start: Date, end: Date

    if (offset === 0) {
      start = new Date(now.setHours(0, 0, 0, 0))
      end = new Date(now.setHours(23, 59, 59, 999))
    } else {
      start = new Date(now.setDate(now.getDate() - offset))
      end = new Date()
    }

    return [start, end]
  }
  /**
   * 取得今年最小至最大日
   * @param offset - 傳入1，代表開始日回推一年，以此類推
   * @returns [最小日, 最大日]
   */
  getThisYearRange(offset: number = 0): [Date, Date] {
    const d = new Date()
    const year = d.getFullYear() - offset
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31, 23, 59, 59, 999)

    return [start, end]
  }
}

export { Time as default }
