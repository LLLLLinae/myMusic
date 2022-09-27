// pages/music-player/index.js
import { audioContext,playerStore } from '../../store/index'

Page({
  data: {
    id: 0,
    // 歌曲总时长
    durationTime: 0,
    // 歌曲播放当前时间
    currentTime: 0,
    lyricInfos: [],
    currentLyricIndex: 0,
    currentLyricText: "",

    isMusicLyric: true,
    currentPage: 0,
    contentHeight: 0,
    sliderValue: 0,
    isSliderChanging: false
  },
  onLoad: function (options) {
    // 1.获取传入的id
    const id = options.id
    this.setData({ id })

    // 3.动态计算内容高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const deviceRadio = globalData.deviceRadio
    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ contentHeight, isMusicLyric: deviceRadio >= 2 })
                                                                            
  },


  // ========================   事件处理   ======================== 
  handleSwiperChange: function(event) {
    const current = event.detail.current
    this.setData({ currentPage: current })
  },
 // 拖动进度条 value的取值范围：0-100
  handleSliderChanging: function(event) {
    const value = event.detail.value
    const currentTime = this.data.durationTime * value / 100
    this.setData({ isSliderChanging: true, currentTime})
  },
 // 直接点击进度条的某一个位置（或者拖动进度条松手后会调用）
  handleSliderChange: function(event) {
    // 1.获取slider变化的值
    const value = event.detail.value

    // 2.计算需要播放的currentTIme
    const currentTime = this.data.durationTime * value / 100

    // 3.设置context播放currentTime位置的音乐
    // 先将音乐暂停
    audioContext.pause()
    // 将音乐设置到currentTime当前时间播放
    audioContext.seek(currentTime / 1000)

    // 4.记录最新的sliderValue, 并且需要讲isSliderChaning设置回false
    this.setData({ sliderValue: value, isSliderChanging: false })
  },

    // ========================   数据监听   ======================== 
    setupPlayerStoreListener: function() {
        // 1.监听currentSong/durationTime/lyricInfos
        playerStore.onStates(["currentSong", "durationTime", "lyricInfos"], ({
          currentSong,
          durationTime,
          lyricInfos
        }) => {
          if (currentSong) this.setData({ currentSong })
          if (durationTime) this.setData({ durationTime })
          if (lyricInfos) this.setData({ lyricInfos })
        })
    
        // 2.监听currentTime/currentLyricIndex/currentLyricText
        playerStore.onStates(["currentTime", "currentLyricIndex", "currentLyricText"], ({
          currentTime,
          currentLyricIndex,
          currentLyricText
        }) => {
          // 时间变化
          if (currentTime && !this.data.isSliderChanging) {
            const sliderValue = currentTime / this.data.durationTime * 100
            this.setData({ currentTime, sliderValue })
          }
          // 歌词变化
          if (currentLyricIndex) {
            this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
          }
          if (currentLyricText) {
            this.setData({ currentLyricText })
          }
        })
    
        // 3.监听播放模式相关的数据
        playerStore.onStates(["playModeIndex", "isPlaying"], ({playModeIndex, isPlaying}) => {
          if (playModeIndex !== undefined) {
            this.setData({ 
              playModeIndex, 
              playModeName: playModeNames[playModeIndex] 
            })
          }
    
          if (isPlaying !== undefined) {
            this.setData({ 
              isPlaying,
              playingName: isPlaying ? "pause": "resume" 
            })
          }
        })
      },

  onUnload: function () {

  },
})