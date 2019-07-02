//获取应用实例
const app = getApp()

Page({
  data: {
    list: []
  },
  startSearch: function (e) {
    let input = e.detail.value;
    if (!input) {
      return;
    }

    const _this = this;
    wx.request({
      url: 'http://localhost:3000/search?keywords=' + input,
      success: function (res) {
        console.log("111");
        console.log(res.data.result);
        _this.setData({
          list: res.data.result.songs
        })
      },
      fail: function (err) { }
    })
  },
  toPlay: function (e) {
    let global = app.globalData;
    let id = e.currentTarget.dataset.id;
    let playList = global.playList;

    // 如果当前歌曲存在于播放列表中，那么数据直接用
    let tempSong = playList.filter(item => item.id === id);
    if (tempSong.length === 1) {
      global.info = tempSong[0]
    } else {
      // 不存在的话，构建，然后添加到对应全局变量中
      // 获取歌曲详情
      wx.request({
        url: 'http://localhost:3000/song/detail?ids=' + id,
        success: function (res) {
          res = res.data.songs[0]
          const song = {
            id: id,
            title: res.name,
            singer: res.ar,
            album: res.al.name,
            coverImgUrl: res.al.picUrl
          }
          global.info = song;
          playList.push(song);
        },
        complete: function () {
          wx.switchTab({
            url: '/pages/music/music',
            success: function (res) { },
            fail: function (err) { }
          })
        }
      });
    }
    // 更新全局变量 id
    global.id = id;
  },
  getRanking: function (num) {
    let _this = this;
    wx.request({
      url: 'https://linshuirong.cn/top/list?idx=' + num,
      success: function (res) {
        _this.setData({
          list: res.data.playlist.tracks
        })
      },
    })
  },
  ranking1: function () {
    this.getRanking(1)
  },
  ranking5: function () {
    this.getRanking(5)
  },
  ranking6: function () {
    this.getRanking(6)
  },
  ranking8: function () {
    this.getRanking(8)
  },
  ranking10: function () {
    this.getRanking(10)
  },
  ranking12: function () {
    this.getRanking(12)
  },
  ranking15: function () {
    this.getRanking(15)
  },
  ranking20: function () {
    this.getRanking(20)
  },
})