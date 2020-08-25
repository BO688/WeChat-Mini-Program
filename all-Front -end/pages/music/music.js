 const app=getApp()
Page({
  data: {
    controlstepclick:true,
    controlstep:3,
    timearray:[],
    timepiece:0,
    lrccontent:"",
    iscircle:true,
    musiccache:false,
    nowmusic:0,
    isplay:false,
    tempFilePath: '../music',
    progress:0,
    duration:0,
    musiclist: app.globalData.musiclist
  },
  history(){
    wx.navigateTo({
      url: '../history/history',
    })
  },
  //自定义提示框
  alertView: function (text) {
    wx.showToast({
      title: text,
      icon: 'success',
      duration: 2000,
    })
  },
  loadalert: function (text) {
    wx.showLoading({
      title: text,
    })
  },
  onShow:function(){
    console.log(app.globalData.song)
    if (app.globalData.song!=null)
    {
      this.clickname(app.globalData.song)
    }
}
  , 
totoporend(){
  
}
,
  onReady(e) {
    //使用 wx.createAudioContext 获取 audio 上下文 context
   //这里无法使用inneraudiocontext
    this.audioCtx = wx.createInnerAudioContext()
    this.audioCtx.src = 'https://www.hbo688z.com/static/thenet/' + this.data.musiclist[this.data.nowmusic] + '.mp3'
    this.audioCtx.onPlay(() => {
      
      // this.setData({
      //   tempnowmusic:"nogo"
      // })
      console.log('开始播放' + this.data.musiclist[this.data.nowmusic])
      
       this.getlrccontent()
       
      var history = wx.getStorageSync('music') || []
      for (var i = 0; i < history.length; i++) {
        if (history[i] == this.data.musiclist[this.data.nowmusic]) {
          history.splice(i, 1);
        }
        }
      history.unshift(this.data.musiclist[this.data.nowmusic])
      wx.setStorageSync('music',history)
      this.timer = setInterval(this.getduration, 1000)
      this.timer1 = setInterval(this.updatelrc,1000)
   
        
    })
  this.audioCtx.onPause(()=>{
    clearInterval(this.timer1)
  })
    this.audioCtx.onStop(() => {
      
      console.log("停止")
      this.setData({
        timepiece:0
      })
      clearInterval(this.timer1)
    })
    this.audioCtx.onTimeUpdate(() => {
      
     this.getcurrenttime()
    })
    this.audioCtx.onWaiting(()=>{
      this.setData({
        musiccache:true
      })
      
      this.loadalert("正在缓冲！")
      console.log("正在缓冲，请稍等！")
    })
   
     
 
    
    
    this.audioCtx.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    
  },
  //AudioContext.play()播放
  playclick () {
    if(this.data.isplay){
      this.audioCtx.pause()
      this.setData({
        isplay: false
      })
     

    }else{
      this.audioCtx.play()  
      this.setData({
        isplay: true
      })
    }
    
  },
  onShareAppMessage: function () {
    this.alertView("分享成功！")
  },
  playmusic(){
   
    this.audioCtx.play()
    this.setData({
      isplay: true
    })

  },
  stopmusic(){
    this.audioCtx.stop()
    this.setData({
      isplay: false
    })
  }
  ,
  //AudioContext.seek(number position)
  sliderChange(e){
    this.audioCtx.pause()
    this.audioCtx.seek(e.detail.value)
    this.setData({
      progress:e.detail.value 
    })
    setTimeout(this.playmusic,100)
  }, 
  
  getduration:function() {
    if (this.audioCtx.duration > 0) {
      this.setData({
        duration: this.audioCtx.duration
      })
      clearInterval(this.timer)
    }

  },
  getcurrenttime(){
    
    if (this.data.duration > 0) {
      this.setData({
        musiccache: false
      })
      this.setData({
        progress: this.audioCtx.currentTime
      })
     
        wx.hideLoading()
      
      // console.log("now"+this.audioCtx.currentTime)
      // console.log("goal" + this.data.duration)
      if (parseInt(this.audioCtx.currentTime) == parseInt(this.data.duration)-1){
        console.log("循环"+this.data.iscircle)
       this.stopmusic();
       if(this.data.iscircle){
         this.playmusic();
       }else{
         this.next();
       }
      }
    }

  },

  next(){
    //this.alertView("切换到下一首")
    if (this.data.nowmusic==this.data.musiclist.length-1){
      this.setData({
        nowmusic:0,
        // tempnowmusic: 0,
      })
    }else{
      this.setData({    
        nowmusic: this.data.nowmusic+1,
        // tempnowmusic: this.data.nowmusic + 1,
      })
    }
    // console.log(this.data.nowmusic)
    this.stopmusic()
    this.audioCtx.src = 'https://www.hbo688z.com/static/thenet/' + this.data.musiclist[this.data.nowmusic]+'.mp3'
    // console.log(this.data.musiclist[this.data.nowmusic])
   this.playmusic()
  },
  last(){ 
    if (this.data.nowmusic == 0) {
      this.setData({   
        nowmusic: this.data.musiclist.length,
        // tempnowmusic: this.data.musiclist.length,
      })
    } 
      this.setData({
        nowmusic: this.data.nowmusic - 1,
        //  tempnowmusic: this.data.nowmusic - 1
      })
    //this.alertView("切换上一首")
    this.stopmusic()
    this.audioCtx.src = 'https://www.hbo688z.com/static/thenet/' + this.data.musiclist[this.data.nowmusic] + '.mp3'
    this.playmusic()
  },
   playchange(){
     if(this.data.iscircle){
       this.alertView("列表循环")
       this.setData({
         iscircle: false
       })
     }else{
       this.alertView("单曲循环")
       this.setData({
         iscircle: true
       })
     }
     
   }
   ,
  clickname:function(event){
    this.alertView("开始播放！")
    app.globalData.song=null
    // console.log(event.target.dataset.name)
   this.stopmusic()
    this.audioCtx.src = 'https://www.hbo688z.com/static/thenet/' + event.target.dataset.name+ '.mp3'
    for(var x in this.data.musiclist){
      if (this.data.musiclist[x] == event.target.dataset.name)
      {
        this.setData({
          nowmusic: parseInt(x) ,
          // tempnowmusic: parseInt(x) 
        })
        // console.log(this.data.nowmusic)
        break
      }
    }
   this.playmusic()
   
 },
  getlrccontent(){
    var that = this;
   wx.request({
     url: 'https://hhb688.cn/static/netlrc/' + this.data.musiclist[this.data.nowmusic] + '.txt', //仅为示例，并非真实的接口地址

     header: {
       'content-type': 'application/json' // 默认值
     },
     method: 'GET',
     success(res) {
       console.log("请求状态码:"+res.statusCode)
       if(res.statusCode!=200){
         that.setData({
           lrccontent: ["暂无歌词！"]
         })
       }else{

         that.setData({
           lrccontent: that.lrcchange(res.data)
         })
       }
     },
     fail: function (res) {
       that.alertfail("网络超时")
       console.log("失败！")
     },
   })
 },
 alertfail(text){
wx.showToast({
  title: text,
  image:"../pic/fail.png"
})
 }
 ,
  lrcchange(text){
    var temp
    var othersign = /\([^)]*\)/g
    var timesign = /(\[[^\]]*\])/g
    temp=text.replace(othersign, "")
    var timepiece = temp.match(timesign)
    temp = temp.replace(timesign, "")
   
    var textline = temp.split(/(\r\n)/g)
   //console.log(timepiece)
    for(var x in timepiece){
      var a = timepiece[x].indexOf("[");
      var b = timepiece[x].indexOf("]");
      
      var c = timepiece[x].substring(a+1, b);
      // console.log(c)
      var d=c.split(":")
      // console.log("m"+parseInt(d[0])) 
      // console.log( "s"+parseInt(d[1])) 
      var min = parseInt(d[0])
      var sec = parseInt(d[1])
      timepiece[x]=min*60+sec
    }
    var final=[]
    for(var x in timepiece){
      if (!isNaN(timepiece[x])){
        final.push(timepiece[x])
      }
    }
    this.setData({
      timearray:final
    })
  // console.log(this.data.timearray)
    var count=0
    var goal=[]
    for(var x in textline){
      
      if (textline[x].replace(/(^\s*)/g, "")== ""|| textline[x] =="↵"){
        continue
      }
      goal.push(textline[x])
    }
 //   console.log(goal)
return goal
  },
  updatelrc(){
    
    if(this.data.timearray!=[]){
     // console.log("下标："+this.data.timepiece)
      //console.log("秒："+this.data.timearray[this.data.timepiece])
      //console.log("歌词："+this.data.lrccontent[this.data.timepiece])
      for(var x in this.data.timearray){
        if (this.data.timearray[x] == parseInt(this.data.progress - this.data.controlstep)) {
          this.setData({
            timepiece: parseInt(x)  + 1
          })
          break;
        }

      }
     
    }
    
  },
  controlstep(event){
    console.log(event)

    if (event.currentTarget.dataset.name == "add"){
      this.alertView("歌词加快+0.5")
      this.setData({
        controlstep:this.data.controlstep-0.5
      })
    } else if (event.currentTarget.dataset.name == "sub"){
      this.alertView("歌词减慢-0.5")
      this.setData({
        controlstep: this.data.controlstep +0.5
      })
    }
  },
showcontrol(){
  // console.log("点击了")
  this.setData({
    controlstepclick: !this.data.controlstepclick
  })
  
  if(this.data.controlstepclick){
    this.animate('#showcontrol', [
      { scale: [1, 1], translateX: 0, opacity: 1.0, rotate: 0, backgroundColor: "rgba(249, 182, 54,0.7)" },
      { scale: [0.5, 0.5], translateX: 25, opacity: 0.5, rotate: 45, backgroundColor: "rgba(108, 202, 207,0.7)" },
      { scale: [0, 0], translateX: 50, opacity: 0.0, rotate: 90, backgroundColor: " rgba(241, 24, 105,0.7)" },
    ], 250, function () {
        this.clearAnimation('#showcontrol', { opacity: true, rotate: true }, function () {
          // console.log("ok?")
      })
    }.bind(this))
  }else{
    this.animate('#showcontrol', [
      { scale: [0, 0], translateX: 50, opacity: 0.0, rotate: 90, backgroundColor:" rgba(241, 24, 105,0.7)" },
      { scale: [0.5, 0.5], translateX: 25, opacity: 0.5, rotate: 45, backgroundColor: "rgba(108, 202, 207,0.7)" },
      { scale: [1, 1], translateX: 0, opacity: 1.0, rotate: 0, backgroundColor: "rgba(249, 182, 54,0.7)" },
    ], 250, function () {
        // console.log("ok?")
        this.clearAnimation('#showcontrol', { opacity: true, rotate: true })
    }.bind(this))
  }
  
  

},

  

 













  
  //wx.playVoice()
  btnClick4: function () {
    var that = this
    wx.startRecord({
      success(res) {
        that.setData({
          tempFilePath: res.tempFilePath
        })
      }
    })
    setTimeout(function () {
      wx.stopRecord() // 结束录音
    }, 10000)
  },
  //
  btnClick5: function () {
    //播放录音
    wx.playVoice({
      path: this.data.tempFilePath,
    })
  },
  //wx.pauseVoice()暂停播放录音
  btnClick6: function () {
    wx.pauseVoice()
  },
  //wx.stopVoice()停止播放录音
  btnClick7: function () {
    wx.stopVoice()
  },
  
})