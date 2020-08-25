// pages/cartoon/cartoon.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tipshowcheck: true,
    tipclosecheck: true,
    word:'下班我就要回家练竖笛了',
    pre:null,
    check:false,
    base64:null,
    timeout:false,
  },
  tipshow() {
    var that = this
    if (this.data.tipshowcheck) {
      this.setData({
        tipshowcheck: !this.data.tipshowcheck
      })
      this.animate(".content", [
        { bottom:"100px",left: "0px", opacity: "0" },
        { bottom: "125px",left: "34px", opacity: "0.1" },
        { bottom: "145px",left: "68px", opacity: "1" }
      ], 1000, function () {
        that.setData({
          tipshowcheck: !that.data.tipshowcheck
        })
      })
    }

  },
  action() {
    this.tipshow()
    setTimeout(this.tipclose, 2000)
  },
  tipclose() {
    var that = this
    if (this.data.tipclosecheck) {
      this.setData({
        tipclosecheck: !this.data.tipclosecheck
      })
      this.animate(".content", [
        { bottom: "145px",left: "68px", opacity: "1" },
        { bottom: "125px",left: "34px", opacity: "0.1" },
        { bottom: "100px",left: "0px", opacity: "0" }
      ], 1000, function () {
        that.setData({
          tipshowcheck: true,
          tipclosecheck: !that.data.tipclosecheck
        })
      })
    }
  },
  imgpre(){
    this.setData({
      timeout:!this.data.timeout
    })
  },
  choose(){
    var that=this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        
        const tempFilePaths = res.tempFilePaths
        
        
        console.log(res.tempFiles[0].size);
        that.setData({
          check:true,
          pre: tempFilePaths//必须使用这样才能设置展示临时路径
        })
        if (res.tempFiles[0].size >=3145728){
          that.alertfail("请选择小于3MB的图片")
          that.setData({
            check: false,
            // pre: tempFilePaths//必须使用这样才能设置展示临时路径
          })
        }
      },
      fail:function(res){
        console.log(res) 
      }
    })
  },
  sure(){
    var that=this
    if(!this.data.check){
      this.alertfail('请先选择')
      return 
      }
      
      wx.showLoading({
        title: '正在转化中',
      })
    wx.uploadFile({
      url: "https://www.hhb688.cn/searchsamepic",
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
        console.log(data.statusCode)
      //  console.log(data)
        // console.log(data.data)
        if (data.statusCode!=200){
          that.alertfail('网络超时')
          return
        }else{
        that.alertsuccess("完成")
        that.setData({
          
          base64: data.data.replace(/[\r\n]/g, ""),
          timeout:!that.data.timeout
        })
        }
        // console.log(data)
        setTimeout(that.imgpre,7000)
        
      },fail:function(){
        wx.hideLoading()
        that.alertfail('网络超时')
      }
    })
  }
  ,
  alertfail(text){
    this.setData({
      word:"我只是一个音乐家，这些东西不会很正常"
    })
    this.action()
    wx.showToast({
      title: text,
      image:"../pic/fail.png",
      duration:2000
    })
  }, alertsuccess(text) {
    this.setData({
      word: "这比我吹竖笛还简单"
    })
    this.action()
    wx.showToast({
      title: text,
      image: "../pic/success.png",
      duration: 2000
    })
  },
  save(){
    // console.log("save")
    var manager=wx.getFileSystemManager();
    var that=this
    manager.writeFile({
      filePath:wx.env.USER_DATA_PATH+'/pic'+".png",
      data: this.data.base64,
      encoding:"base64",
      success:res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/pic'  + ".png",
          success:function(res){
            that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail:function(res){
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
this.action()
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

  }
})