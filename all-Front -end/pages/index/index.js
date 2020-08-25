//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    tipshowcheck: true,
    tipclosecheck: true,
    rotatespeed:2500,
    word:"Hi~ 你有看到海绵宝宝吗？",
      tempFilePaths:null,
    backgroundcolor: ["#eeaea6",
     "#eeeea6",
      "#eeeaa6","#C9D9FF"],
      colorindex:0,
    loading: false,
    checkpic: 0,//0初始化,1场景,2其他,3地标等等
    landmark:null,
    analysis:null,
    other:null,
    "permission":{
      "scope.userLocation": {
        "desc": "你的位置信息将用于微信小程序"
      }
    },
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  action() {
    this.tipshow()
    setTimeout(this.tipclose, 2000)
  },
  //事件处理函数
  bindViewTap: function() {
    wx.switchTab({
      url: '../logs/logs'
    })
  },
  onShow(){
    this.action()
  },
  onShareAppMessage:function(){
    wx.showToast({
      title: "分享成功!",
      image: "../pic/success.png",
      duration: 1000,
      mask: true
    })
  },
  
  onLoad: function () {
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    //   console.log(app.globalData.userInfo);
    // } else if (this.data.canIUse) {

    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //     console.log(res.userInfo);
    //   }
    // } else {
    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {

    //       app.globalData.userInfo = res.userInfo
    //       console.log(app.globalData.userInfo);
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }

  this.left()
  
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  tipshow() {
    var that = this
    if (this.data.tipshowcheck) {
      this.setData({
        tipshowcheck: !this.data.tipshowcheck
      })
      this.animate(".content", [
        { bottom: "0px", opacity: "0" },
        { bottom: "15px", opacity: "0.5" },
        { bottom: "30px", opacity: "1" }
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
        { bottom: "30px", opacity: "1" },
        { bottom: "15px", opacity: "0.5" },
        { bottom: "0px", opacity: "0" },
      ], 1000, function () {
        that.setData({
          tipshowcheck: true,
          tipclosecheck: !that.data.tipclosecheck
        })
      })
    }
  },
  aipic(){
   var  that=this
    wx.chooseImage({ 
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths);
        // console.log(res);
        that.setData({
          tempFilePaths: tempFilePaths//必须使用这样才能设置展示临时路径
        })
        if (res.tempFiles[0].size >= 3145728) {
         
          that.alertfail("请选择小于3MB的图片");
          return;
        }
      
        wx.showLoading({
          title: '正在识别',
        })
       
        that.setData({
         rotatespeed:1250,
          loading:!that.data.loading,
        })
      
     
        // wx.cloud.uploadFile({
        //   cloudPath: 'example.png', // 上传至云端的路径
        //   filePath: tempFilePaths[0], // 小程序临时文件路径
        //   success: res => {
        //     // 返回文件 ID
        //     console.log(res)
        //   },
        //   fail: console.error
        // })
        wx.uploadFile({
          url: "https://www.hhb688.cn/bdaipic",
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            "file": tempFilePaths[0]
          },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function (data) {
            
            // console.log(data)
            res = JSON.parse(data.data)
            console.log(res)
            if (data.statusCode != 200||res["error_code"] != undefined || res["error_msg"]!=undefined){
              
              that.alertfail("网络异常")
              return
            }
            if (res["result"]["landmark"]!=undefined){//地标
            that.setData({
              checkpic:3,
              landmark: res["result"]["landmark"]
            })
              // console.log(res["result"]["landmark"])
            } else if (res["result"][0]["root"]!=undefined){//场景（最后必出）
              that.setData({
                checkpic: 1,
                analysis: res["result"]
              })
       
            }
            else {//菜品,动植物的解析
              that.setData({
                checkpic: 2,
                other: res["result"]
              })
           
            }
            
            that.alertsuccess("识别成功！")
            if (that.data.colorindex>=3){
              that.setData({
                 // 窗口的背景色
                colorindex: 0
              })
            }else{
              that.setData({
              // 窗口的背景色
                colorindex: that.data.colorindex + 1
              })
            }
           
          }, fail: function (err) {
            
            that.alertfail("出错了！请稍等")
          }
        })
      }
      
    })
  },
  alertsuccess(text){
    this.action()
    wx.showToast({
      title: text,
      image: "../pic/success.png",
      duration: 2000,
    })
    this.setData({
      word: "我是天才！",
      loading: false,
      rotatespeed:2500,
    })
    
  },
  alertfail(text) {
    this.action()
    wx.showToast({
      title: text,
      image:"../pic/fail.png",
      duration: 2000,
    })
    this.setData({
      word:"这这这...不是我做的，是章鱼哥做的！",
      loading: false,
      rotatespeed: 2500,
    })
  
  },
  right(){
    var that =this
    this.animate("#right", [
      { bottom:"0%",backgroundColor: "rgba(249, 182, 54,0.7)" },
      { bottom: "50%",backgroundColor: "rgba(108, 202, 207,0.7)" },
      { bottom: "100%",backgroundColor: " rgba(241, 24, 105,0.7)" },
    ], this.data.rotatespeed,function(){
that.top()
    })
  },
  left() {
    var that = this
    this.animate("#left", [
      { top: "0%",  backgroundColor: "rgba(249, 182, 54,0.7)" },
      {top: "50%", backgroundColor: "rgba(108, 202, 207,0.7)" },
      { top: "100%",  backgroundColor: " rgba(241, 24, 105,0.7)" },
    ], this.data.rotatespeed,function(){
that.bottom()
    })
  },
  top() {
    var that = this
    this.animate("#top", [
      { left: "100%", backgroundColor: "rgba(249, 182, 54,0.7)" },
      { left: "0%", backgroundColor: "rgba(108, 202, 207,0.7)" },
      { left: "-100%", backgroundColor: " rgba(241, 24, 105,0.7)" },
    ], this.data.rotatespeed,function(){
that.left()
    })
  },
  bottom() {
    var that = this
    this.animate("#bottom", [
      { left: "0%", backgroundColor: "rgba(249, 182, 54,0.7)" },
      { left: "50%", backgroundColor: "rgba(108, 202, 207,0.7)" },
      {left: "100%", backgroundColor: " rgba(241, 24, 105,0.7)" },
    ], this.data.rotatespeed,function(){
that.right()    })
  }
})
