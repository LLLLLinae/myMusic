const BASE_URL = "http://codercba.com:9002"
const TIMEOUT = 10000

class Request {
    request(options){
        return new Promise((resolve,reject) => {
            wx.request(
                {
                  ...options,
                    url:BASE_URL+options.url,
                    success:(res)=>{
                        resolve(res.data)
                    },
                    fail:reject
            })
        })
    }
    get(options){
       return this.request({ ...options, method: "get" })
    }
    post(options){
        return this.request({ ...options, method: "post" })
    }
}

export default new Request()