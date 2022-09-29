// 业务数据服务器
// const BASE_URL = "http://codercba.com:9002"
// const BASE_URL = "http://123.207.32.32:9001"
const BASE_URL =  "https://coderwhy-music.vercel.app/"
// 验证用户登录服务器地址
const LOGIN_BASE_URL = "http://123.207.32.32:3000"
const TIMEOUT = 10000

const token = wx.getStorageInfoSync("token_key")

class Request {
  constructor(baseURL, authHeader = {}){
    this.baseURL = baseURL
    this.authHeader = authHeader
  }
    request(url, method, params, isAuth=false,header = {}) {
      const finalHeader = isAuth ? { ...this.authHeader, ...header }: header
      return new Promise((resolve, reject) => {
        wx.request({
          url: this.baseURL + url,
          method: method,
          header: finalHeader,
          data: params,
          success: function(res) {
            resolve(res.data)
          },
          fail: reject
        })
      })
    }
  
    get(url, params,isAuth=false,header) {
      return this.request(url, "GET", params,isAuth,header)
    }
  
    post(url, data,isAuth=false,header) {
      return this.request(url, "POST", data,isAuth,header)
    }
  }
  
  const request = new Request(BASE_URL)

  const loginRequest = new Request(LOGIN_BASE_URL,{
    token
  })
  
  export default request
  export {
    loginRequest
  }