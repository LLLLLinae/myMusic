// pages/home-music/index.js
import { rankingStore } from '../../store/index'

import { getBanners, getSongMenu } from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'

const throttleQueryRect = throttle(queryRect, 1000)

Page({
  data: {
    swiperHeight: 0,
    banners: [],
    hotSongMenu: [],
    recommendSongMenu: [],
    recommendSongs: [],
    rankings: { 0: {}, 2: {}, 3: {} }
  },

  onLoad: function (options) {
    // 获取页面数据
    this.getPageData()

    // 从store获取共享的数据
    rankingStore.onState("newRanking", this.getRankingHandler(0))
    rankingStore.onState("originRanking", this.getRankingHandler(2))
    rankingStore.onState("upRanking", this.getRankingHandler(3))
  },

  // 网络请求
  getPageData: function() {
    getBanners().then(res => {
      this.setData({ banners: res.banners })
    })
    //  获取热门歌单数据
    getSongMenu().then(res => {
      this.setData({ hotSongMenu: res.playlists })
    })
    // 获取推荐歌单数据
    getSongMenu("华语").then(res => {
      this.setData({ recommendSongMenu: res.playlists })
    })
  },

  // 事件处理
  handleSearchClick: function() {
    wx.navigateTo({
      url: '/pages/detail-search/index',
    })
  },

  handleSwiperImageLoaded: function() {
    // 获取图片的高度(如果去获取某一个组件的高度)
    throttleQueryRect(".swiper-image").then(res => {
      const rect = res[0]
      this.setData({ swiperHeight: rect.height })
    })
  },

  onUnload: function () {
    // rankingStore.offState("newRanking", this.getNewRankingHandler)
  },

  getRankingHandler: function(idx) {
    return (res) => {
      if (Object.keys(res).length === 0) return
      console.log("idx:", idx)
      const name = res.name
      const coverImgUrl = res.coverImgUrl
      const playCount = res.playCount
      const songList = res.tracks.slice(0, 3)
      const rankingObj = {name, coverImgUrl, playCount, songList}
      const newRankings = { ...this.data.rankings, [idx]: rankingObj}
      this.setData({ 
        rankings: newRankings
      })
      console.log(this.data.rankings)
    }
  },


  // getUpRankingHandler: function(res) {
  //   if (Object.keys(res).length === 0) return
  //   const name = res.name
  //   const coverImgUrl = res.coverImgUrl
  //   const songList = res.tracks.slice(0, 3)
  //   const rankingObj = {name, coverImgUrl, songList}
  //   const originRankings = [...this.data.rankings]
  //   originRankings.push(rankingObj)
  //   this.setData({ 
  //     rankings: originRankings
  //   })
  // }
})