var ctx = "" // 用于获取canvas
var leftMargin = "" //文字距离左边边距
var topMargin = "" //文字距离右边边距
Page({
  data: {
    list: ['人人车司机', '500-8000元/月', '日结', '20元'],
    pic: "../pic/family.jpg",
    canvasWidth: '', // canvas宽度
    canvasHeight: '', // canvas高度
    imagePath: null // 分享的图片路径
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this
    try{
        that.setData({
          list: JSON.parse(decodeURIComponent(options.list)),
        pic: options.pic,
        })
    }catch(e){
    }
    finally{
      var sysInfo = wx.getSystemInfo({
        success: function (res) {
          that.setData({
            //设置宽高为屏幕宽，高为屏幕高的80%，因为文档比例为5:4
            canvasWidth: res.windowWidth,
            canvasHeight: res.windowHeight
          })
          leftMargin = res.windowWidth
          topMargin = res.windowHeight
        },
      })

    }
    

  
     
     
   
  },

  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
    ctx = wx.createCanvasContext('myCanvas')
    this.addImage()
   
    setTimeout(this.tempFilePath,1000)
  },
  //画背景图
  addImage: function () {
    var context = wx.createContext();
    var that = this;
    var path = "../pic/bg.jpg";
    //将模板图片绘制到canvas,在开发工具中drawImage()函数有问题，不显示图片
    //不知道是什么原因，手机环境能正常显示
    ctx.drawImage(path, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
    this.addPic(this.data.pic)
    this.addlist(this.data.list)
    ctx.draw()
  },
  //导出图片
  tempFilePath: function () {
    let that = this;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function success(res) {
        console.log(res.tempFilePath)
        that.setData({
          imagePath: res.tempFilePath
            });
        // wx.saveFile({
        //   tempFilePath: res.tempFilePath,
        //   success: function success(res) {
        //     that.setData({
        //       imagePath: res.savedFilePath
        //     });
        //   }
        // });
      }
    });
  },
  // 添加数组描述
  addlist(list){
    ctx.font = 'normal bold 20px sans-serif';
    ctx.setTextAlign('center'); // 文字居中
    ctx.setFillStyle("#222222");
    var i=0;
    for(var x in list){
      if(x==0){
        ctx.font = 'normal bold 25px sans-serif';
        ctx.fillText(list[x], this.data.canvasWidth / 3.5, this.data.canvasHeight/8 + i++ * 25)
      }else if(x==17){ 
        ctx.font = 'normal bold 30px sans-serif';
        ctx.fillText(list[x], this.data.canvasWidth / 1.4, this.data.canvasHeight / 3 + this.data.canvasHeight / 4)
      }else if(x==18){
        ctx.font = 'normal bold 50px sans-serif';
        ctx.setFillStyle("red");
        ctx.fillText(list[x], this.data.canvasWidth / 1.4, this.data.canvasHeight / 3 + this.data.canvasHeight / 4+60)
      }
      else{
        ctx.font = 'normal bold 20px sans-serif';
        ctx.fillText(list[x], this.data.canvasWidth / 3.5, this.data.canvasHeight / 9 + i++ * 23+20)
      }
      
    }
  },
  //添加图片
  addPic(path){
    ctx.drawImage(path, this.data.canvasWidth/1.9, this.data.canvasHeight/9, this.data.canvasWidth/3 , this.data.canvasHeight/3);
    ctx.drawImage("../pic/QRcode.png", this.data.canvasWidth / 1.8, this.data.canvasHeight / 1.4, this.data.canvasWidth / 3.5, this.data.canvasHeight / 4);
  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    // return eventHandler接收到的分享参数
    return {
      title: "AI图像助手"
      // this.data.title
      ,

      // path: '/pages/Test/Test',
      imageUrl:"../pic/family.jpg"
      //  this.data.imagePath
    };
  },
  again(){
    // var pageList= getCurrentPages()
    // var x;
    // for( x in pageList)
    // {}
    // console.log(pageList[x-1])
    wx.navigateBack({
      delta:"1"
    })
  },
  save(){
    wx.saveImageToPhotosAlbum({
      filePath: this.data.imagePath,
    })
    // wx.canvasToTempFilePath({
    //   canvasId: 'myCanvas',
    //   success: function success(res) {
       
    //   }
    // });
    
  }



})