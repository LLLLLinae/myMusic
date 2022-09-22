// index.js
// 获取应用实例
import { getTopMV } from '../../service/api_music.js'
const app = getApp()

Page({
  data: {
    topMVs: [],
    hasMore: true
  },
  // 获取banner数据
  getBannerList() {
    getTopMV().then((res)=>{
        this.setData({banners:res.banners})
    })
  },
  onLoad() {
    this.getBannerList()
  },
  handleSearchClick(){
      wx.navigateTo({
        url: '/pages/details-search/index',
      })
  }
})
