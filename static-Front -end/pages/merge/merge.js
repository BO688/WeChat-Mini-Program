// pages/cartoon/cartoon.js
const wechat = require('../../utils/promise.js');
var app = getApp();
Page({
  data: {
    access_token: app.globalData.access_token,
    
    pre: null,
    template: null,
    face_merge: null,
    face_template: null,
    change_ai_base64: null,
    timeout:false,
    template_check:false,
    pre_check:false,
    history_check: true,
    history_list: [],
  },
  onShow() {
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
  choose() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths
        that.setData({
          pre_check: false,
        })
        wx.compressImage({
          src: tempFilePaths[0], // 图片路径
          quality: 50,// 压缩质量
          success: function (data) {
          
            wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
              if (JSON.parse(d.data).errmsg == "ok") {
                if (res.tempFiles[0].size >= 2097152) {
                  that.alertfail("请选择小于2MB的图片")
                } else {
            that.setData({
              pre_check:true,
              pre: tempFilePaths[0]
            })
                }
              } else {
                // console.log("敏感")
                that.alertfail("敏感图片!")

              }
            }).catch(e => {
              console.log(e);
            })
          }
        })

      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  choose_template() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths
          that.setData({
            template_check:false,
            
          })
          wx.compressImage({
            src: tempFilePaths[0], // 图片路径
            quality: 50,// 压缩质量
            success: function (data) {
     
              wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
                if (JSON.parse(d.data).errmsg == "ok") {
                  if (res.tempFiles[0].size >= 2097152) {
                    that.alertfail("请选择小于2MB的图片")
                  } else {
                    that.setData({
                      template_check: true,
                      template: tempFilePaths[0]
                    })
                  }
                } else {
                  // console.log("敏感")
                  that.alertfail("敏感图片!")

                }
              }).catch(e => {
                console.log(e);
              })
            }
          })

        
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  alertfail(text) {
   
    wx.showToast({
      title: text,
      image: "../pic/fail.png",
      duration: 3000
    })
  }, 
  alertsuccess(text) {
    var that = this
    wx.showToast({
      title: text,
      image: "../pic/success.png",
      duration: 2000
    })
  },
  change_ai_save() {
    // console.log("save")
    var manager = wx.getFileSystemManager();
    var that = this
    manager.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/pic' + ".png",
      data: this.data.change_ai_base64,
      encoding: "base64",
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/pic' + ".png",
          success: function (res) {
            // that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail: function (res) {
            // that.alertfail("保存失败")
            // console.log(res)
          }
        })
      }
    })

  },

  ai_change_face() {
    if (!(this.data.pre_check && this.data.template_check)){
      return
    }
    var that = this
    wx.showLoading({
      title: 'AI正在转换',
    })
    wx.uploadFile({
      url: app.globalData.request_url+"/face_merge",
      filePath: that.data.pre,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (data) {
        if (data.statusCode != 200) {
          that.alertfail('人脸融合超时')
          return
        } else {
          // console.log(data)
          var result = JSON.parse(data.data)
          that.setData({
            face_merge: result.result
          })

        }
      }, fail: function (data) {
        that.alertfail('人脸融合超时')
        return
      }
    })
    wx.uploadFile({
      url: app.globalData.request_url+"/face_template",
      filePath: that.data.template,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (data) {
        if (data.statusCode != 200) {
          that.alertfail('人脸融合超时')
          return
        } else {
          // console.log(data)
          var result = JSON.parse(data.data)
          that.setData({
            face_template: result.result
          })

        }
      }, fail: function (data) {
        that.alertfail('人脸融合超时')
        return
      }
    })
    this.timer_wait_pic = setInterval(this.wait_pic, 1000)
  },
  tipshow() {
    var that = this
    this.animate("#pre", [
      { top:"0px", opacity: "1" },
      { top: "75px", opacity: "0.5" },
      { top: "150px", opacity: "0" },
    ], 2000)
    this.animate("#template", [
      { top: "250px", opacity: "1" },
      { top: "200px", opacity: "0.5" },
      { top: "150px", opacity: "0" },
    ], 2000)
    setTimeout(this.timeoutfunction,1000)
  },
  timeoutfunction(){
    this.setData({
      timeout:true
    })
    this.animate("#result", [
      { opacity: "0" },
      { opacity: "0.5" },
      { opacity: "1" },
    ], 2000)
  }
  ,
  tipclose() {
    var that = this
    
    this.animate("#result", [
      { opacity: "1" },
      { opacity: "0.5" },
       { opacity: "0" },
    ], 2000,function(){
      that.setData({
        timeout: false
      })
    })
    this.animate("#pre", [
      { top: "150px", opacity: "0" },
      { top: "75px", opacity: "0.5" },
      { top: "0px", opacity: "1" },
    ], 2000)
    this.animate("#template", [
      { top: "150px", opacity: "0" },
      { top: "200px", opacity: "0.5" },
      { top: "250px", opacity: "1" },
    ], 2000)
  },
  wait_pic() {
    var that = this

    if (this.data.face_merge != null && this.data.face_template != null) {
      wx.hideLoading();
      wx.request({
        url: app.globalData.request_url+'/wx_face_mergeface', //仅为示例，并非真实的接口地址
        data: {
          'merge_face': this.data.face_merge,
          'feature_face': this.data.face_template
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          // console.log(res.data)
          if (res.data.result == undefined) {
            that.alertfail("请重新选择")
            
            return
          }
          that.setData({
            change_ai_base64: res.data.result
          })
          that.alertsuccess("转换成功！")
          that.tipshow()
          that.save_history()
        }
      })
      clearInterval(this.timer_wait_pic)
    }
  },
 
  onShareAppMessage: function (res) {
    return {
      title: "AI图像助手",
      imageUrl: "../pic/family.jpg"
    };
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
   var temptemplate = this.data.template
   wx.compressImage({
     src: temptemplate,
     quality: 50,
     success: function (data) {
       temptemplate = data.tempFilePath
     }
   })
   var template_base64 = wx.getFileSystemManager().readFileSync(temptemplate, "base64")
    var jsondata = {}
    jsondata.pic = pic_base64
    jsondata.template = template_base64
   jsondata.result = this.data.change_ai_base64
    var array = wx.getStorageSync("merge") || []
    array.unshift(jsondata)
   wx.setStorageSync("merge", array);
    this.get_history_list()
  },
  history_show(e) {
    
    var that = this
    var temp = this.data.history_list[e.currentTarget.dataset.index]
    var save = wx.getFileSystemManager();
    var number1 = Math.random()
    var file1 = wx.env.USER_DATA_PATH + '/pic' + number1 + '.png'
    save.writeFile({
      filePath: file1,
      data: temp['pic'],
      encoding: 'base64',
      success: res => {
        // console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
    var number2 = Math.random()
    var file2 = wx.env.USER_DATA_PATH + '/pic' + number2 + '.png'
    save.writeFile({
      filePath: file2,
      data: temp['template'],
      encoding: 'base64',
      success: res => {
        // console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
    that.setData({
      pre: file1,
      template:file2,
      change_ai_base64:temp['result'],
      pre_check:true,
      template_check:true
    })
    if(this.data.timeout){
      that.animate("#result", [
        { opacity: "1" },
        { opacity: "0.5" },
        { opacity: "0" },
      ], 500, function () {
        that.setData({
          timeout: false
        })
        that.tipshow()
        
      })
    }else{
      that.tipshow()
    }
   
    
   

  },
  get_history_list() {
    var history_list = wx.getStorageSync("merge")
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
})