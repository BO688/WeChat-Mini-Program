// pages/cartoon/cartoon.js
const wechat = require('../../utils/promise.js');
var app=getApp()
Page({
  data: {
    access_token: app.globalData.access_token,
    
    pre:null,
    check:false,
    base64:null,
    timeout:false,
    history_check: true,
    history_list: [],
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
       
        
        // console.log(res.tempFiles[0].size);
        
        wx.compressImage({
          src: tempFilePaths[0], // 图片路径
          quality: 50,// 压缩质量
          success: function (data) {
            // console.log(data)
            wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
              if (res.tempFiles[0].size >= 3145728) {
                that.alertfail("请选择小于3MB的图片")
                that.setData({
                  check: false,
                  // pre: tempFilePaths//必须使用这样才能设置展示临时路径
                })
              }
              if (JSON.parse(d.data).errmsg == "ok") {
                that.setData({
                    pre: tempFilePaths[0],//必须使用这样才能设置展示临时路径
                  check: true,
                })
              } else {
                // console.log("敏感")
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
      url: app.globalData.request_url+"/searchsamepic",
      filePath: this.data.pre,
      name: 'file',
      formData: {
        "file": this.data.pre
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (data) {
        
        wx.hideLoading()
        // console.log(data.statusCode)
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
        that.save_history()
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
    wx.showToast({
      title: text,
      image:"../pic/fail.png",
      duration:3000
    })
  },
   alertsuccess(text) {
    var that = this
    
    this.setData({
      word: "这比我吹竖笛还简单"
    })
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
            // that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail:function(res){
            // that.alertfail("保存失败")
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
    this.alway()
  },
  alway(){
    var that=this
    this.animate("#photos", [
      { rotateY: 0 },
      { rotateY: 360 },
    ], 10000,function(){
      that.alway()
    })
  },
  save_history() {
    var temppic = this.data.pre
    wx.compressImage({
      src: temppic,
      quality: 50,
      success: function (data) {
        temppic = data.tempFilePath
      }
    })
    var pic_base64 = wx.getFileSystemManager().readFileSync(temppic, "base64")
    var jsondata={}
    jsondata.pic = pic_base64
    jsondata.cartoon = this.data.base64
    var array = wx.getStorageSync("cartoon") || []
    array.unshift(jsondata)
    wx.setStorageSync("cartoon", array);
    this.get_history_list()
  },
  history_show(e) {
   
    var that = this

    var temp = this.data.history_list[e.currentTarget.dataset.index]
    var imgSrc = temp['pic']
    var save = wx.getFileSystemManager();
    var number = Math.random()
    var file = wx.env.USER_DATA_PATH + '/pic' + number + '.png'
    save.writeFile({
      filePath: file,
      data: imgSrc,
      encoding: 'base64',
      success: res => {
        // console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
    console.log(file)

    that.setData({
      pre: file,
      base64: temp['cartoon'],
     check:true,
      timeout: !that.data.timeout
    })
    setTimeout(that.imgpre, 7000)





  },
  get_history_list() {
    var history_list = wx.getStorageSync("cartoon")
    this.setData({
      history_list: history_list
    })

  },
  history_list_control() {
    var that = this
    if (this.data.history_check) {
      this.animate("#history", [
        { top: -(that.data.history_list.lenght * 60 + 42), opacity: "0" },
        { top: 0, opacity: "1" }
      ], 1000)
      
    } else {
      this.animate("#history", [
        { top: 0, opacity: "1" },
        { top: -(that.data.history_list.lenght * 60 + 42), opacity: "0" }
      ], 1000)
    }
    this.setData({
      history_check: !this.data.history_check
    })

  }



  /**
   * 生命周期函数--监听页面显示
   */,
  onShow: function () {
    var fsm = wx.getFileSystemManager()
    var path = wx.env.USER_DATA_PATH
    fsm.readdir({
      dirPath: path, /// 获取文件列表
      success(res) {
        // console.log(res)
        res.files.forEach((val) => { // 遍历文件列表里的数据
          // console.log(val)
          fsm.unlink({
            filePath: path + '/' + val
          });
        })
      },
      fail(err) {
        console.log(err)
      }
    })
    wx.getSavedFileList({
      success(res) {
        // console.log(res)
        res.fileList.forEach((val, key) => { // 遍历文件列表里的数据
          // 删除存储的垃圾数据
          wx.removeSavedFile({
            filePath: val.filePath
          });
        })
      }
    })
    this.get_history_list()
    this.setData({
      access_token: app.globalData.access_token,

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
  onShareAppMessage: function (res) {
    return {
      title: "AI图像助手",
      imageUrl: "../pic/family.jpg"
    };
  },
})