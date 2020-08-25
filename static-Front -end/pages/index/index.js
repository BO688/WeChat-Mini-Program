// pages/index/index.js
var app=getApp();
Page({
  data: {
    word:"报告生成成功！",
    welcome:false,
    tip:0,
    width:0,
    height:0,
    comment_check:false,
    comment:"",
    attitude:"",
    comment_show:false,
    ready:false,
  },
  onLoad: function (options) {
    var that=this
    var sysInfo = wx.getSystemInfo({
      success: function (res) {
        that.setData({
          //设置宽高为屏幕宽，高为屏幕高的80%，因为文档比例为5:4
          width: res.windowWidth,
          height: res.windowHeight
        })
      },
    })

    var history={"history":null}
    var pic="{\"pic\":\"abcankshdasodoiasj\"}"
    var array=[]
    pic = JSON.parse(pic)
   history.pic=pic.pic
    array.push(history)
    // console.log(array)
  },
  onReady: function () {
    this.setData({
      ready:true
    })
    var that = this
    this.animate("#move3", [
      {  top: "-150px" },
      { top: "0px" }
    ], 1000)
    this.animate("#move1", [
      {  left: "-80%" },
      { left: "5%" }
    ], 1000)
    this.animate("#move2", [
      {  left: "105%" },
      { left: "5%" }
    ], 1000)
    this.animate("#move4", [
      {  left: "-80%" },
      { left: "5%" }
    ], 1000)
    this.animate("#move5", [
      {  left: "105%" },
      { left: "5%" }
    ], 1000)
    this.animate("#move6", [
      {  left: "-80%" },
      { left: "5%" }
    ], 1000)
  },
  onShow: function () {
  },
  toAiJudge(){
    wx.navigateTo({
      url: '../AIjudge/AIjudge',
    })
  },
  toCartoon() {
    wx.navigateTo({
      url: '../cartoon/cartoon',
    })
  },
  toFace_score() {
    wx.navigateTo({
      url: '../face_score/face_score',
    })
  },
  toMerge() {
    wx.navigateTo({
      url: '../merge/merge',
    })
  },
  toSkin() {
    wx.navigateTo({
      url: '../skin/skin',
    })
  },
  // input(e){
  //   // console.log(e.currentTarget.id)
  //   this.animate("#"+e.currentTarget.id, [
  //     { scale: [1, 1] },
  //     { scale: [1.1, 1.1] }
  //   ], 10)
  // },
  // output(e){
  //   var that=this
  //   // console.log(e.currentTarget.id)
  //   this.animate("#"+e.currentTarget.id, [
  //     { scale: [1.1, 1.1] },
  //     { scale: [1, 1]}
  //   ], 10,function(){
  //     if (e.currentTarget.id=="move1"){
  //       that.toAiJudge()
  //     } else if (e.currentTarget.id == "move2"){
  //       that.toFace_score()
  //     } else if (e.currentTarget.id == "move4") {
  //       that.toCartoon()
  //     } else if (e.currentTarget.id == "move5") {
  //       that.toSkin()
  //     } else if (e.currentTarget.id == "move6") {
  //       that.toMerge()
  //     } 
  //   })
  // },
  tipshow() {
    var that = this
    if(this.data.tip==3){  //关闭
      that.setData({
        tip: 0
      })
      that.animate("#tip3", [
        
        { height: that.data.height * 0.6 + "px" },
        { height: 0 },
      ], 500,function(){
        that.animate("#tipbg", [
          { opacity: "1" },
          { opacity: "0.1" },
          { height: "0%", opacity: "0" },
        ], 250)
      })
     
      
      
    }else{
      that.setData({//叠加
        tip: that.data.tip + 1
      })
      
      if (this.data.tip == 1) {//第一张
        that.animate("#tipbg", [
          { height: "100%", opacity: "0" },
          { opacity: "0.1" },
          { opacity: "1" }
        ], 250, function () {
          that.animate("#tip1", [
            { height:0 },
            { height: that.data.height*0.6+"px" },
          ], 250)
          that.animate("#photos", [
            { rotateY: -120, opacity: "0"  },
            { rotateY: 0, opacity: "1" },
          ], 500)
        })
       
       
      } else if (this.data.tip == 2) {//第二张
        that.animate("#tip2", [
          { height: 0 },
          { height: that.data.height * 0.6 + "px" },
        ], 250)
        that.animate("#photos", [
          { rotateY: 0 },
          { rotateY: -115.5 },
        ], 500)
      } else if (this.data.tip == 3) {//第三张
        that.animate("#tip3", [
          { height: 0 },
          { height: that.data.height * 0.6 + "px" },
        ], 250)
        that.animate("#photos", [
          { rotateY: -115.5 },
          { rotateY: -235 },
        ], 500)
      }
    }
    
    



  },
  welcome(){
    var that=this
    
    if(!this.data.welcome){
      this.animate("#bg", [{
      height: "100%",
      opacity: "0"
    },
    {
      opacity: "0.1"
    },
    {
      opacity: "1"
    }
    ], 400,function(){
      that.animate("#welcome", [{
      height: "0%",
      opacity: "0"
    },
    {
      opacity: "0.5"
    },
        {
          height: "80%",
      opacity: "1"
    }
    ], 500)
      that.setData({
        welcome: !that.data.welcome
      })
    })
      
    }else{
      that.animate("#welcome", [
        {
          height: "80%",
          opacity: "1"
        },
        {
          opacity: "0.5"
        }, {
          height: "0%",
          opacity: "0"
        },

      ], 500, function () {
        that.animate("#bg", [{
          height: "100%",
          opacity: "1"
        },

        {
          height: "100%",
          opacity: "0.1"
        },
        {
          height: "0%",
          opacity: "0"
        },
        ], 250, function () {
          that.setData({
            welcome: !that.data.welcome
          })

        })
      })
     
    }
   

  }
  ,
  checkComment(e){
    // console.log(e)
    if(e.type=="change"){
      this.setData({
        attitude: e.detail.value
      })
    } else if (e.type == "input"){
      this.setData({
        comment: e.detail.value
      })
    }
   if(this.data.comment!=""&&this.data.attitude!=""){
     this.setData({
       comment_check: true
     })
   }else{
     this.setData({
       comment_check: false
     })
   }
  },
  sentComment(){
    if(this.data.comment_check){
      this.setData({
        comment_check:false
      })
      var that = this
      wx.showLoading({
        title: '正在发送',
      })
      wx.request({
        url: app.globalData.request_url+'/wxComment',
        data: {
          "attitude": that.data.attitude,
          "comment": that.data.comment
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (data) {
          // console.log(data.data.result)
          if (data.data.result=="success"){
            that.alertsuccess('发送成功')
            that.closecomment()
          }else{
            that.alertfail('发送失败')
            that.setData({
              comment_check: true
            })
          }
        },
        fail: function (data) {
          that.alertfail('发送失败')
          console.log(data)
          this.setData({
            comment_check: true
          })
        }
      })
    }
    

  },
  showcomment(){
    
    this.animate("#commentBG", [
      { opacity: "0" },
      { opacity: "1" }
    ], 500)
    this.setData({
      comment_show:true
    })
    this.animate("#comment", [
      { opacity: "0" },
      { opacity: "1" }
    ], 500)
  },
  closecomment(){
    var that=this

    this.animate("#comment", [
      
      { opacity: "1" },
      { opacity: "0" },
    ], 500,function(){
      that.animate("#commentBG", [
       
        { opacity: "1" },
        { opacity: "0" },
      ], 500, function () {
        that.setData({
          comment_show: false
        })
      })
    })
    
   
  },

  alertfail(text) {
    // this.action()
    wx.showToast({
      title: text,
      image: "../pic/fail.png",
      duration: 3000
    })
  },
  alertsuccess(text) {
    var that = this

    // this.action()
    wx.showToast({
      title: text,
      image: "../pic/success.png",
      duration: 2000
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

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: "AI图像助手",
      imageUrl: "../pic/family.jpg"
    };
  },
})