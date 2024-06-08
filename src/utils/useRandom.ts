const generateRandomString = (length: number) => {
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  var randomString = ""
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length)
    randomString += charset[randomIndex]
  }
  return randomString
}

export { generateRandomString }
