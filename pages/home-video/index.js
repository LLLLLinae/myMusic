// pages/main-video/index.js
import {getTopMV} from '../../service/api_video.js'
Page({
    data: {
        topMVs: [],
        hasMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getTopMVData(0)
    },
    // 页面到达底部的生命周期函数
    onReachBottom(){
        this.getTopMVData(this.data.topMVs.length)
    },
    // 上拉刷新
    onPullDownRefresh(){
        this.getTopMVData(0)
    },
    // 获取banner数据
    getTopMVData(offset) {
        console.log(111)
    //   if(!hasMore&&offset!==0) return
      getTopMV(offset).then((res)=>{
          if(offset===0){
            this.setData({topMVs:res.data})
          } else{
            this.setData({topMVs:this.data.topMVs.concat(res.data)})
          }
          this.setData({hasMore:res.hasMore})
      })
    },
    handleVideoItemClick(){}
})