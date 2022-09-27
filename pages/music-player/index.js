// pages/music-player/index.js
import { getSongDetail, getSongLyric } from '../../service/api_player'
import { parseLyric } from '../../utils/parse-lyric'
import { audioContext } from '../../store/index'

Page({
  data: {
    id: 0,
    currentSong: {},
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

    // 2.根据id获取歌曲信息
    this.getPageData(id)

    // 3.动态计算内容高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const deviceRadio = globalData.deviceRadio
    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ contentHeight, isMusicLyric: deviceRadio >= 2 })

    // 4.使用audioContext播放歌曲
    audioContext.stop()
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    audioContext.autoplay = true

    // 5.audioContext的事件监听
    this.setupAudioContextListener()
  },

  // ========================   网络请求   ======================== 
  getPageData: function(id) {
    getSongDetail(id).then(res => {
      this.setData({ currentSong: res.songs[0], durationTime: res.songs[0].dt })
    })

    getSongLyric(id).then(res => {
      const lyricString = res.lrc.lyric
      const lyrics = parseLyric(lyricString)
      this.setData({ lyricInfos: lyrics })
    })
  },

  // ========================   audio监听   ======================== 
  setupAudioContextListener: function() {
    // 当从服务器获取到的音频流解码好了可以播放之后
    audioContext.onCanplay(() => {
      // 播放视频
      audioContext.play()
    })

    // 监听时间改变-歌曲播放过程中时间改变回调的函数
    audioContext.onTimeUpdate(() => {
      // 1.获取当前时间()
      const currentTime = audioContext.currentTime * 1000

      // 2.根据当前时间修改currentTime/sliderValue
      // 当正在手动拖动进度条时，不要让进度条跟随歌曲播放滑动
      if (!this.data.isSliderChanging) {
        const sliderValue = currentTime / this.data.durationTime * 100
        this.setData({ sliderValue, currentTime })
      }

      // 3.根据当前时间去查找播放的歌词
      // 查找规则：遍历lyricInfos，找到时间大于currentTime的节点，停止遍历，此时前一个节点就是要找的节点
      // 即时间小于currentTime的的节点中时间最大的那个节点
      let i = 0
      for (; i < this.data.lyricInfos.length; i++) {
        const lyricInfo = this.data.lyricInfos[i]
        if (currentTime < lyricInfo.time) {
          break
        }
      }
      // 设置当前歌词的索引和内容
      const currentIndex = i - 1
      if (this.data.currentLyricIndex !== currentIndex) {
        const currentLyricInfo = this.data.lyricInfos[currentIndex]
        this.setData({ currentLyricText: currentLyricInfo.text, currentLyricIndex: currentIndex })
      }
    })
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
    this.setData({ isSliderChanging: true, currentTime, sliderValue: value })
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

  onUnload: function () {

  },
})