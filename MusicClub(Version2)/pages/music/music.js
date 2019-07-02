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
  onShow: function () {

    const global = app.globalData;
    const info = global.info;
    const likedList = global.likedList
    const id = global.id

    console.log(info);

    if (info) {
      this.setData({
        title: info.title,
        album: info.album,
        singer: info.singer,
        coverImgUrl: info.coverImgUrl
      })

      this.setBAM(info);
    } else {
      let title = '红昭愿';
      let album = '红昭愿';
      let singer = '音阙诗听';
      let coverImgUrl = 'http://p1.music.126.net/8ltR3o9R8uJ9_5Cc71cDhA==/109951162951242154.jpg';

      this.setData({
        title,
        album,
        singer,
        coverImgUrl
      })
      this.setBAM({
        title,
        album,
        singer,
        coverImgUrl
      })
    }

    let _this = this;
    let temp = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46' // 设置了 src 之后会自动播放

    if (id) {
      wx.request({
        url: 'http://localhost:3000/song/url?id=' + id,
        success: function (res) {
          let mp3 = res.data.data[0].url
          _this.setMp3(mp3)
        },
        fail: function (err) {
          _this.setMp3(temp)
          // 设置不喜欢的图标
          _this.setData({
            likedIcon: '/img/unliked.svg'
          })
        }
      });
      this.getLyric(id);

      let isLiked = likedList.find(item => {
        return item.id === id
      })

      if (!isLiked) {
        // 当前歌曲不在我喜欢的列表中
        _this.setData({
          likedIcon: '/img/unliked.svg'
        })
      } else {
        // 在我喜欢的列表中
        _this.setData({
          likedIcon: '/img/liked.svg'
        })
      }
    } else {
      _this.setMp3(temp);
      // 设置不喜欢的图标
      _this.setData({
        likedIcon: '/img/unliked.svg'
      })
    }

    // 切换播放图标
    this.setData({
      playIcon: '/img/pause.svg'
    })

  },
  getLyric: function (id) {
    let _this = this;
    wx.request({
      url: 'http://localhost:3000/lyric?id=' + id,
      success: function (res) {
        _this.setData({
          lyric: res.data.lrc.lyric.replace(/\[.*\]/g, ''),
        })
      },
      fail: function (err) { }
    })
  },
  mainHandler: function () {
    const bam = wx.getBackgroundAudioManager();
    if (bam.paused) {
      bam.play();
      this.setData({
        playIcon: '/img/pause.svg'
      })
    } else {
      bam.pause();
      this.setData({
        playIcon: '/img/play.svg'
      })
    }
  },
  setBAM: function (data) {
    // 设置背景音乐的相关属性
    const bam = wx.getBackgroundAudioManager();
    bam.title = data.title;
    bam.album = data.album;
    bam.singer = data.singer;
    bam.coverImgUrl = data.coverImgUrl;

    this.setData({
      title: data.title,
      album: data.album,
      singer: data.singer,
      coverImgUrl: data.coverImgUrl
    });
  },
  setMp3: function (mp3) {
    if (!mp3) {
      return;
    }
    // 设置背景音乐的相关属性
    const bam = wx.getBackgroundAudioManager();
    const _this = this;

    bam.src = mp3;
    bam.title = this.data.title;
    setTimeout(() => {
      _this.setDuration(bam.duration)
    }, 500)

    bam.onTimeUpdate(function () {
      // 实时更新slider长度，和左侧显示时间
      const currentTime = Math.floor(bam.currentTime);

      let seconds = Math.floor(currentTime % 60) + '';
      if (seconds.length === 1) {
        // 个位数的话，前面加0
        seconds = '0' + seconds
      }

      if (!_this.data.sliderIsChanging) {
        _this.setData({
          currentTime: Math.floor(currentTime / 60) + ':' + seconds,
          sliderValue: Math.floor(currentTime / _this.data.duration * 100)
        })
      }
    })

    bam.onEnded(function () {
      const playList = app.globalData.playList;
      const id = app.globalData.id;
      // 音乐自动停止，如果列表中下一首存在，继续播放下一首

      // 当前音乐在播放列表的下标
      const index = playList.findIndex(item => {
        return item.id === id;
      });

      // 如果列表中下一首存在
      const nextSong = playList[index + 1]
      if (nextSong) {
        _this.setBAM(nextSong);
        _this.getLyric(nextSong.id);
        // 获取歌曲链接
        wx.request({
          url: 'http://localhost:3000/song/url?id=' + nextSong.id,
          success: function (res) {
            let mp3 = res.data.data[0].url
            _this.setMp3(mp3)
            _this.setData({
              likedIcon: '/img/liked.svg'
            })
          },
          fail: function (err) {
            // 设置不喜欢的图标
            _this.setData({
              likedIcon: '/img/unliked.svg'
            })
          }
        });
      }
    })
  },
  setDuration: function (duration) {
    // 设置歌曲时长，和转换后的分钟数（显示时）
    let seconds = Math.floor(duration % 60) + '';
    if (seconds.length === 1) {
      // 个位数的话，前面加0
      seconds = '0' + seconds
    }
    this.setData({
      duration: duration,
      endTime: Math.floor(duration / 60) + ':' + seconds
    });
  },
  likeHandler: function () {
    // 我喜欢的： 添加或者删除
    const global = getApp().globalData
    const id = global.id;
    const likedList = global.likedList;
    const data = this.data

    console.log(data);
    const index = likedList.find(item => {
      return item.id === id;
    });

    if (!index) {
      // 没有的话，添加到我喜欢的
      likedList.push({
        id: id,
        coverImgUrl: data.coverImgUrl,
        title: data.title,
        singer: data.singer,
        album: data.album,
      });

      this.setData({
        likedIcon: '/img/liked.svg'
      });
      return;
    }
    console.log(index);
    console.log("ssss");
    // 从我喜欢的移除;

    for (var i = 0; i < likedList.length; i++) {
      if (likedList[i].id == index.id) {
        likedList.splice(i, 1);
      }
    }
    this.setData({
      likedIcon: '/img/unliked.svg'
    });
  },
  commentHandler: function () {
    // 评论页
    wx.navigateTo({
      url: '/pages/comment/comment'
    })
  }

})