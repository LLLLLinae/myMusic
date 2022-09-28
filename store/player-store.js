import {
  HYEventStore
} from 'hy-event-store'
import {
  getSongDetail,
  getSongLyric
} from '../service/api_player'
import {
  parseLyric
} from '../utils/parse-lyric'

const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
  state: {
    isFirstPlay: true,
    id: '',
    // 当前歌曲信息
    currentSong: {},
    // 歌曲总时长
    durationTime: 0,
    // 歌词信息
    lyricInfos: [],

    currentTime: 0,
    currentLyricIndex: 0,
    currentLyricText: "",

    isPlaying: false,

    playModeIndex: 0, // 0: 循环播放 1: 单曲循环 2: 随机播放
    // 播放列表
    playListSongs: [],
    // 当前播放歌曲的索引
    playListIndex: 0
  },
  actions: {
    playMusicWithSongIdAction(ctx, {id,isRefresh = false}) {
      if (ctx.id == id && !isRefresh) {
        this.dispatch("changeMusicPlayStatusAction", true)
        return
      }

      // 保存歌曲id
      ctx.id = id

       // 0.修改播放的状态(初始化)
       ctx.isPlaying = true
       ctx.currentSong = {}
       ctx.durationTime = 0
       ctx.lyricInfos = []
       ctx.currentTime = 0
       ctx.currentLyricIndex = 0
       ctx.currentLyricText = ""

      // 1.根据id请求数据
      // 请求歌曲详情
      getSongDetail(id).then(res => {
        ctx.currentSong = res.songs[0]
        ctx.durationTime = res.songs[0].dt
      })
      // 获取歌词信息
      getSongLyric(id).then(res => {
        const lyricString = res.lrc.lyric
        const lyrics = parseLyric(lyricString)
        ctx.lyricInfos = lyrics
      })

      // 2.播放对应id的歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.autoplay = true

      // 3.监听audioContext一些事件
      if (ctx.isFirstPlay) {
        this.dispatch("setupAudioContextListenerAction")
        ctx.isFirstPlay = false
      } 
    },

    setupAudioContextListenerAction(ctx) {
      // 1.监听歌曲可以播放
      // 当从服务器获取到的音频流解码好了可以播放之后
      audioContext.onCanplay(() => {
        // 播放视频
        audioContext.play()
      })

      // 2.监听时间改变-歌曲播放过程中时间改变回调的函数
      audioContext.onTimeUpdate(() => {
        // 1.获取当前时间()
        const currentTime = audioContext.currentTime * 1000

        // 2.根据当前时间修改currentTime
        ctx.currentTime = currentTime

        // 3.根据当前时间去查找播放的歌词
        // 查找规则：遍历lyricInfos，找到时间大于currentTime的节点，停止遍历，此时前一个节点就是要找的节点
        // 即时间小于currentTime的的节点中时间最大的那个节点
        if (!ctx.lyricInfos.length) return
        let i = 0
        for (; i < ctx.lyricInfos.length; i++) {
          const lyricInfo = ctx.lyricInfos[i]
          if (currentTime < lyricInfo.time) {
            break
          }
        }
        // 设置当前歌词的索引和内容
        const currentIndex =  i - 1
        if (ctx.currentLyricIndex !== currentIndex) {
          const currentLyricInfo = ctx.lyricInfos[currentIndex]
          ctx.currentLyricText = currentLyricInfo.text
          ctx.currentLyricIndex = currentIndex
        }
      })
      
      // 3.监听歌曲播放完成
      audioContext.onEnded(() => {
        this.dispatch("changeNewMusicAction")
      })
    },

    changeMusicPlayStatusAction(ctx, isPlaying = true) {
      ctx.isPlaying = isPlaying
      ctx.isPlaying ? audioContext.play(): audioContext.pause()
    },
    changeNewMusicAction(ctx, isNext = true) {
      // 1.获取当前索引
      let index = ctx.playListIndex

      // 2.根据不同的播放模式, 获取下一首歌的索引
      switch(ctx.playModeIndex) {
        case 0: // 顺序播放
          index = isNext ? index + 1: index -1
          if (index === -1) index = ctx.playListSongs.length - 1
          if (index === ctx.playListSongs.length) index = 0
          break
        case 1: // 单曲循环
          break
        case 2: // 随机播放
          index = Math.floor(Math.random() * ctx.playListSongs.length)
          break
      }

      // 3.获取歌曲
      let currentSong = ctx.playListSongs[index]
      if (!currentSong) {
        currentSong = ctx.currentSong
      } else {
        // 记录最新的索引
        ctx.playListIndex = index
      }

      // 4.播放新的歌曲
      this.dispatch("playMusicWithSongIdAction", { id: currentSong.id, isRefresh: true })
    }
  }
})

export {
  audioContext,
  playerStore
}