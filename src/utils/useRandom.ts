const generateRandomString = (length: number) => {
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  var randomString = ""
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length)
    randomString += charset[randomIndex]
  }
  return randomString
}

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export { generateRandomString, generateRandomNumber }
