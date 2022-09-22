import request from './index'

export function getBanners() {
  return request.get("/banner", {
    type: 2
  })
}