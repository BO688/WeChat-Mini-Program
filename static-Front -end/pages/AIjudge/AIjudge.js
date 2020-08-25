//index.js
//获取应用实例
const wechat = require('../../utils/promise.js');
var app = getApp()
Page({
  data: {
    access_token: app.globalData.access_token,
    check:true,
    tipshowcheck: true,
    tipclosecheck: true,
    rotatespeed:2500,
    word:"Hi~ 你有看到海绵宝宝吗？",
      tempFilePaths:null,
    loading: false,
    checkpic: 0,//0初始化,1场景,2其他,3地标等等
    landmark:null,
    analysis:null,
    other:null,
   history_check:true,
   history_list:null,
   history_pic:null,
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
    
    this.get_history_list()
    this.setData({
      access_token: app.globalData.access_token,
    
    })
  },
  onReady(){
    
    this.action()
  },
  onShareAppMessage: function (res) {
    return {
      title: "AI图像助手",
      imageUrl: "../pic/family.jpg"
    };
  },
  
  onLoad: function () {
   
  this.left()
  
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
        { bottom: "-20px", },
      ], 1200, function () {
        that.setData({
          tipshowcheck: true,
          tipclosecheck: !that.data.tipclosecheck
        })
      })
    }
  },
  choose(){
   var  that=this
    wx.chooseImage({ 
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {

        wx.showLoading({
          title: '识别图片安全',
        })
        const tempFilePaths = res.tempFilePaths
       

        if (res.tempFiles[0].size >= 3145728) {
          that.alertfail("请选择小于3MB的图片");
          return;
        }
        wx.compressImage({
          src: tempFilePaths[0], // 图片路径
          quality: 50,// 压缩质量
          success: function (data) {
            // console.log(data)
            wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
              wx.hideLoading()
              if (JSON.parse(d.data).errmsg == "ok") {
                that.setData({
                  history_pic: null,
                  tempFilePaths: tempFilePaths//必须使用这样才能设置展示临时路径
                })
                that.setData({
                  check: false,
                })
                
              } else {
                // console.log("敏感")
                that.alertfail("请重新选择")
                that.setData({
                  check: true,

                })
              }
            }).catch(e => {
              wx.hideLoading()
              console.log(e);
            })
          }
        })
        
       
        
      }
      
    })
  },
  sure(){
    // console.log("before")
    if(this.data.check){
      return
    }
    // console.log("after")
    wx.showLoading({
      title: '正在识别',
    })
    var that=this
    that.setData({
      rotatespeed: 1250,
      loading: !that.data.loading,
    })
    wx.uploadFile({
      url: app.globalData.request_url+"/bdaipic",
      filePath: that.data.tempFilePaths[0],
      name: 'file',
      formData: {
        "file": that.data.tempFilePaths[0]
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (data) {

        // console.log(data)
        try{
          var res = JSON.parse(data.data)
        }
        catch(e){
          that.alertfail("网络异常")
          return
        }
        
        // console.log(res)
        if (data.statusCode != 200 || res["error_code"] != undefined || res["error_msg"] != undefined) {

          that.alertfail("网络异常")
          return
        }
        
        if (res["result"]["landmark"] != undefined) {//地标
          that.setData({
            checkpic: 3,
            landmark: res["result"]["landmark"]
          })
          // console.log(res["result"]["landmark"])
        } else if (res["result"][0]["root"] != undefined) {//场景（最后必出）
          that.setData({
            checkpic: 1,
            analysis: res["result"]
          })

        }
        else {  //菜品,动植物的解析
          that.setData({
            checkpic: 2,
            other: res["result"]
          })

        }

        that.alertsuccess("识别成功！")

//这里开始保存
that.save_history(res)
      }, fail: function (err) {

        that.alertfail("出错了！请稍等")
      }
    })
  }

  ,
  alertsuccess(text){
    wx.hideLoading()
    // console.log("success")
    var that=this
    this.action()
    // wx.showToast({
    //   title: text,
    //   image: "../pic/success.png",
    //   duration: 2000,
    // })
    this.setData({
      word: text,
      loading: false,
      rotatespeed:2500,
    })
    
  },
  alertfail(text) {
    wx.hideLoading()
    // console.log("fail")
    this.action()
    // wx.showToast({
    //   title: text,
    //   image:"../pic/fail.png",
    //   duration: 3000,
    // })
    this.setData({
      word:text,
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
  },
 save_history(jsondata){
   var temppic = this.data.tempFilePaths[0]
  wx.compressImage({
    src:temppic,
    quality:50,
    success:function(data){
      temppic=data.tempFilePath
    }
  })
   var pic_base64 = wx.getFileSystemManager().readFileSync(temppic, "base64")
   jsondata.pic=pic_base64
   var array = wx.getStorageSync("AIjudge")||[]
   array.unshift(jsondata)
   wx.setStorageSync("AIjudge",array );
   this.get_history_list()
 },
 history_show(e){
   
   var that=this
   
  var temp= this.data.history_list[e.currentTarget.dataset.index]["result"]
   that.setData({
    //  check:false,
     history_pic: this.data.history_list[e.currentTarget.dataset.index]["pic"]
   })
   if (temp["landmark"]!=undefined){
     that.setData({
       checkpic: 3,
       landmark: temp["landmark"]
     })

   } else if (temp[0]["root"] != undefined){
     that.setData({
       checkpic: 1,
       analysis: temp
     })

   }else{
     that.setData({
       checkpic: 2,
       other: temp
     })
   }
   
   
 },
 get_history_list(){
   var history_list=wx.getStorageSync("AIjudge")
   this.setData({
     history_list:history_list
   })

 },
 history_list_control(){
   var that=this
   if(this.data.history_check){
     this.animate("#history", [
       { top:-(that.data.history_list.lenght*55+62), opacity: "0" },
       { top:0,opacity: "1" }
     ], 1000)
     
   }else{
     this.animate("#history", [
       { top: 0,  opacity: "1" },
       { top: -(that.data.history_list.lenght * 55 + 62),  opacity: "0" }
     ], 1000)
   }
   this.setData({
     history_check:!this.data.history_check
   })
  
 }
  
})
