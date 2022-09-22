// pages/main-video/index.js
import {getMusicBanner} from '../../service/music'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        topMVList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      console.log(111)
      getMusicBanner().then((res)=>{
            console.log(res)
            // this.setData({topMVList:res.data})
        })
    },
})