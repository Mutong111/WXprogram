const app = getApp();

Page({
  data: {
    coverImgUrl: undefined, // 封面图
    title: undefined, // 标题
    singer: undefined, // 歌手
    album: undefined, // 专辑
    lyric: '歌词歌词', // 歌曲
    currentTime: '00:00', // 歌曲当前时间，分钟
    endTime: '00:00', // 歌曲总时长，分钟
    duration: 0, // 歌曲总时长，秒
    playIcon: '/img/pause.svg', // 播放图标
    likedIcon: '/img/unliked.svg', // 收藏，喜欢 图标
    sliderValue: 23,
    sliderIsChanging: false
  },
  onLoad: function () {
    wx.playBackgroundAudio({
      dataUrl: 'http://isure.stream.qqmusic.qq.com/C400001Qu4I30eVFYb.m4a?guid=3557280824&vkey=B2B317F56121743341FD688EE74BF6CE4BE6E8842DBFB2EFBD76C480368BAC216259FF699DBB231DB688329439D586F4C19FC6FEC47EE3C7&uin=0&fromtag=66',
      title: "音乐"
    })
  }
})