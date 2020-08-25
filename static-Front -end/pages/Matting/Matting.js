// pages/cartoon/cartoon.js
const wechat = require('../../utils/promise.js');
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    access_token: app.globalData.access_token,
    backgroundcolor: app.globalData.color,
    colorindex: app.globalData.colorindex,
    tipshowcheck: true,
    tipclosecheck: true,
    pre: null,
    temp:null,
    check: false,
    base64: null,
    timeout: false,
    word:"嗨~你有蟹黄堡的秘方吗？"
  },
  animateshow() {
    this.setData({
      timeout: true
    })
  },
  animateclose(){
    this.setData({
      timeout: false,
      temp: null,
    })
    
  },
  tipshow() {
    var that = this
    if (this.data.tipshowcheck) {
      this.setData({
        tipshowcheck: !this.data.tipshowcheck
      })
      this.animate(".content", [
        { width: "10px", opacity: "0" },
        { width: "80px", opacity: "0.1" },
        { width: "150px", opacity: "1" }
      ], 1000, function () {
        that.setData({
          tipshowcheck: !that.data.tipshowcheck
        })
      })
    }

  },
  tipclose() {
    var that = this
    if (this.data.tipclosecheck) {
      this.setData({
        tipclosecheck: !this.data.tipclosecheck
      })
      this.animate(".content", [
        { width: "150px", opacity: "1" },
        { width: "80px", opacity: "0.1" },
        { width: "10px", opacity: "0" },
      ], 1000, function () {
        that.setData({
          tipshowcheck: true,
          tipclosecheck: !that.data.tipclosecheck
        })
      })
    }
  },
  action() {
    this.tipshow()
    setTimeout(this.tipclose, 2000)
  },
  choose() {
    var that = this
   
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        
        const tempFilePaths = res.tempFilePaths
        console.log(res.tempFiles[0].size);
        that.setData({
          word:"来试试我的新发明~",
          base64:null,
       
            check: false,

          pre: tempFilePaths,//必须使用这样才能设置展示临时路径
          temp:tempFilePaths
        })

        wx.compressImage({
          src: that.data.pre[0], // 图片路径
          quality: 50,// 压缩质量
          success: function (data) {
            console.log(data)
            wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
              if (JSON.parse(d.data).errmsg == "ok") {
                that.setData({
                  check: true,

                })
              } else {
                console.log("敏感")
                that.alertfail("请重新选择")
                that.setData({
                  check: false,

                })
              }
            }).catch(e => {
              console.log(e);
            })
          }
        })
        
        if (res.tempFiles[0].size >= 3145728) {
          that.alertfail("请选择小于3MB的图片")
          that.setData({
            check: false,
            // pre: tempFilePaths//必须使用这样才能设置展示临时路径
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  sure() {
    var that = this
    if (!this.data.check) {
      this.alertfail('请先选择')
      return
    }
    that.setData({
      word: "天才总是需要时间的，等等吧哈哈"
    })
    wx.showLoading({
      title: '正在抠图中',
    })
    wx.uploadFile({
      url: app.globalData.request_url+"/face_segment",
      filePath: this.data.pre[0],
      name: 'file',
      formData: {
        "file": this.data.pre[0]
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (data) {

        wx.hideLoading()
        //  console.log(data)
        // console.log(data.data)
        if (data.statusCode != 200 || JSON.parse(data.data).error!=undefined) {
          that.setData({
            word: "什么！好像出错了？你重新试试吧!"
          })
          that.alertfail('网络超时')
          return
        } else {
          
          that.setData({
            word: "哈哈哈不错吧!赶紧长按保存吧"
          })
          wx.hideLoading()
         
          that.setData({
            base64: JSON.parse(data.data).body_image.replace(/[\r\n]/g, ""),
            timeout: !that.data.timeout
          })
          that.alertsuccess("完成")
          
        }
        // console.log(data)
        

      }, fail: function () {
        wx.hideLoading()
        that.alertfail('网络超时')
        that.setData({
          word: "什么！好像出错了？你重新试试吧!"
        })
      }
    })
  }
  ,
  alertfail(text) {
    this.action()
    wx.showToast({
      title: text,
      image: "../pic/fail.png",
      duration: 3000
    })
  }, alertsuccess(text) {
    this.animateshow()
    setTimeout(this.animateclose, 7000)
    this.action()
    var that = this
    if (that.data.colorindex >= that.data.backgroundcolor.length - 1) {
      that.setData({
        colorindex: 0
      })
      app.globalData.colorindex = 0;
    } else {
      app.globalData.colorindex++;
      that.setData({
        colorindex: that.data.colorindex + 1
      })
    }
    wx.showToast({
      title: text,
      image: "../pic/success.png",
     
      duration: 2000
    })
  },
  save() {
    // console.log("save")
    var manager = wx.getFileSystemManager();
    var that = this
    manager.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/pic' + ".png",
      data: this.data.base64,
      encoding: "base64",
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/pic' + ".png",
          success: function (res) {
            that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail: function (res) {
            that.alertfail("保存失败")
            // console.log(res)
          }
        })
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.action()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData.colorindex)
    this.setData({
      access_token:app.globalData.access_token,
      colorindex: app.globalData.colorindex
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  

   
})