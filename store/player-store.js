import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric } from '../../service/api_player'
import { parseLyric } from '../utils/parse-lyric'
const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
    state: {    
				id:'',
		// 当前歌曲信息
    currentSong: {},
    // 歌曲总时长
		durationTime: 0,
		// 歌词信息
		lyricInfos:[],
		currentTime:"",
		currentLyricIndex: 0,
    currentLyricText: "",
    },
    actions: {
        playMusicWithSongIdAction(ctx,{id){
            // 1.保存歌曲id
            ctx.id = id
            // 2.根据id获取歌曲信息
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
						this.dispatch("setupAudioContextListenerAction")
		},

		setupAudioContextListenerAction(ctx){
    // 当从服务器获取到的音频流解码好了可以播放之后
    audioContext.onCanplay(() => {
      // 播放视频
      audioContext.play()
    })

    // 监听时间改变-歌曲播放过程中时间改变回调的函数
    audioContext.onTimeUpdate(() => {
      // 1.获取当前时间()
      const currentTime = audioContext.currentTime * 1000

      // 2.根据当前时间去查找播放的歌词
      // 查找规则：遍历lyricInfos，找到时间大于currentTime的节点，停止遍历，此时前一个节点就是要找的节点
      // 即时间小于currentTime的的节点中时间最大的那个节点
      let i = 0
      for (; i < ctx.lyricInfos.length; i++) {
        const lyricInfo = ctx.lyricInfos[i]
        if (currentTime < lyricInfo.time) {
          break
        }
      }
      // 设置当前歌词的索引和内容
      const currentIndex = i - 1
      if (ctx.currentLyricIndex !== currentIndex) {
				const currentLyricInfo = ctx.lyricInfos[currentIndex]
				ctx.currentLyricText = currentLyricInfo.text
				ctx.currentLyricIndex = currentIndex
      }
    })
		}
    })

export {
	audioContext,
  playerStore
}
