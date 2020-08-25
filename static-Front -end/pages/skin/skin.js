
const wechat = require('../../utils/promise.js');
var app = getApp();
Page({
  data: {
    access_token: app.globalData.access_token,
    tipshowcheck: true,
    tipclosecheck: true,
    pre: null,
    facialfeatures_check: false,
    facialfeatures1: null,
    skin_check: false,
    skin1: null,
    // timeout: false,
    history_check: true,
    history_list: [],
    nav: [{
      name: '五官分析'
    }, {
      name: '皮肤分析'
    }],
    currentTab: 0,
  },
  swichNav: function(e) {
    var that = this;
    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur,
      })
    }
  },
  // imgpre() {
  //   this.setData({
  //     timeout: false
  //   })
  // },
  onReady() {
    // this.action()
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
      success: function(res) {
        // console.log(res)
        const tempFilePaths = res.tempFilePaths
        // console.log(res.tempFiles[0].size);
        
        wx.compressImage({
          src: tempFilePaths[0], // 图片路径
          quality: 50, // 压缩质量
          success: function(data) {
            // console.log(data)
            wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
              if (JSON.parse(d.data).errmsg == "ok") {
                that.setData({
                  pre: tempFilePaths[0]
                })
                if (res.tempFiles[0].size >= 2097152) {
                  that.alertfail("请选择小于2MB的图片")
                } else {
                  wx.showLoading({
                    title: '正在识别',
                  })

                  that.timer = setInterval(that.identifying, 1000);
                  setTimeout(that.timeouting, 6000);
                  that.skin_send_url_with_img(app.globalData.request_url+"/face_skin", tempFilePaths[0])
                  that.facialfeatures_send_url_with_img(app.globalData.request_url +"/face_facialfeatures", tempFilePaths[0])

                }
              } else {
                console.log("敏感")
                that.alertfail("请重新选择")

              }
            }).catch(e => {
              console.log(e);
            })
          }
        })

      },
      fail: function(res) {
        console.log(res)
      }
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


  facialfeatures(data) {
    this.setData({
      facialfeatures1: null,
      facialfeatures_check: false,
    })
    var temp = []
    if (data == "" || JSON.parse(data).error != undefined) {

      temp.push("识别不出五官，请重新选择图片")
      this.setData({
        facialfeatures1: temp
      })
      return;
    }
    var data = JSON.parse(data)
    var result = data.result
    // console.log(result)
    temp.push("五官分析")
    if (result.eyebrow.eyebrow_type == "bushy_eyebrows") {
      temp.push("眉型:粗眉")
    } else if (result.eyebrow.eyebrow_type == "eight_eyebrows") {
      temp.push("眉型:八字眉")
    } else if (result.eyebrow.eyebrow_type == "raise_eyebrows") {
      temp.push("眉型:上挑眉")
    } else if (result.eyebrow.eyebrow_type == "straight_eyebrows") {
      temp.push("眉型:一字眉")
    } else if (result.eyebrow.eyebrow_type == "round_eyebrows") {
      temp.push("眉型:拱形眉")
    } else if (result.eyebrow.eyebrow_type == "arch_eyebrows") {
      temp.push("眉型:柳叶眉")
    } else if (result.eyebrow.eyebrow_type == "thin_eyebrows") {
      temp.push("眉型:细眉")
    }

    if (result.eyes.eyes_type == "round_eyes") {
      temp.push("眼型:圆眼")
    } else if (result.eyes.eyes_type == "thin_eyes") {
      temp.push("眼型:细长眼")
    } else if (result.eyes.eyes_type == "big_eyes") {
      temp.push("眼型:大眼")
    } else if (result.eyes.eyes_type == "small_eyes") {
      temp.push("眼型:小眼")
    } else if (result.eyes.eyes_type == "normal_eyes") {
      temp.push("眼型:标准眼")
    }

    if (result.face.face_type == "pointed_face") {
      temp.push("脸型:瓜子脸")
    } else if (result.face.face_type == "oval_face") {
      temp.push("脸型:椭圆脸")
    } else if (result.face.face_type == "diamond_face") {
      temp.push("脸型:菱形脸")
    } else if (result.face.face_type == "round_face") {
      temp.push("脸型:圆形脸")
    } else if (result.face.face_type == "long_face") {
      temp.push("脸型:长形脸")
    } else if (result.face.face_type == "square_face") {
      temp.push("脸型:方形脸")
    } else if (result.face.face_type == "normal_face") {
      temp.push("脸型:标准脸")
    }
    if (result.jaw.jaw_type == "flat_jaw") {
      temp.push("下巴:圆下巴")
    } else if (result.jaw.jaw_type == "sharp_jaw") {
      temp.push("下巴:尖下巴")
    } else if (result.jaw.jaw_type == "square_jaw") {
      temp.push("下巴:方下巴")
    }
    if (result.mouth.mouth_type == "thin_lip") {
      temp.push("唇型:薄唇")
    } else if (result.mouth.mouth_type == "thick_lip") {
      temp.push("唇型:厚唇")
    } else if (result.mouth.mouth_type == "smile_lip") {
      temp.push("唇型:微笑唇")
    } else if (result.mouth.mouth_type == "upset_lip") {
      temp.push("唇型:态度唇")
    } else if (result.mouth.mouth_type == "normal_lip") {
      temp.push("唇型:标准唇")
    }
    if (result.nose.nose_type == "normal_nose") {
      temp.push("鼻型:标准鼻")
    } else if (result.nose.nose_type == "thick_nose") {
      temp.push("鼻型:宽鼻")
    } else if (result.nose.nose_type == "thin_nose") {
      temp.push("鼻型:窄鼻")
    }
    this.setData({
      facialfeatures1: temp,
      facialfeatures_check: true
    })



  },
  facialfeatures_send_url_with_img(url, img) {

    var that = this

    wx.uploadFile({
      url: url,
      filePath: img,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function(data) {


        if (data.statusCode != 200) {
          that.alertfail('五官分析超时')
          that.setData({
            facialfeatures_check: false
          })
          return
        } else {
          // console.log(data)
          that.facialfeatures(data.data)
        }
      },
      fail: function(data) {
        that.setData({
          facialfeatures_check: false
        })
        that.alertfail('五官分析超时')
      }
    })
  },
  skin_send_url_with_img(url, img) {
    var that = this
    wx.uploadFile({
      url: url,
      filePath: img,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function(data) {
        if (data.statusCode != 200) {
          that.alertfail('皮肤分析超时')
          that.setData({
            skin_check: false
          })
          return
        } else {
          that.skin(data.data)
        }
      },
      fail: function(data) {
        that.setData({
          skin_check: false
        })
        that.alertfail('皮肤分析超时')
      }
    })
  },
  skin(data) {
    this.setData({
      skin1: null,
      skin_check: false,
    })
    var temp = []
    if (data == "" || JSON.parse(data).error != undefined) {

      temp.push("识别不出皮肤，请重新选择图片")
      this.setData({
        skin1: temp
      })
      return;
    }

    var data = JSON.parse(data)
    var result = data.result
    // console.log(data)
    temp.push("皮肤分析")
    if (result.skin_color.value == 0) {
      temp.push("肤色:透白")
    } else if (result.skin_color.value == 1) {
      temp.push("肤色:白皙")
    } else if (result.skin_color.value == 2) {
      temp.push("肤色:自然")
    } else if (result.skin_color.value == 3) {
      temp.push("肤色:小麦")
    } else if (result.skin_color.value == 4) {
      temp.push("肤色:黝黑")
    }
    temp.push("肤龄:" + result.skin_age.value)
    if (result.left_eyelids.value == 0) {
      temp.push("左眼双眼皮:单眼皮")
    } else if (result.left_eyelids.value == 1) {
      temp.push("左眼双眼皮:平行双眼皮")
    } else if (result.left_eyelids.value == 2) {
      temp.push("左眼双眼皮:扇形双眼皮")
    }
    if (result.right_eyelids.value == 0) {
      temp.push("右眼双眼皮:单眼皮")
    } else if (result.right_eyelids.value == 0) {
      temp.push("右眼双眼皮:平行双眼皮")
    } else if (result.right_eyelids.value == 0) {
      temp.push("右眼双眼皮:扇形双眼皮")
    }

    if (result.blackhead.value == 0) {
      temp.push("黑头:没有")
    } else if (result.blackhead.value == 1) {
      temp.push("黑头:轻度")
    } else if (result.blackhead.value == 2) {
      temp.push("黑头:中度")
    } else if (result.blackhead.value == 3) {
      temp.push("黑头:重度")
    }
    if (result.dark_circle.value == 0) {
      temp.push("黑眼圈:没有")
    } else if (result.dark_circle.value == 1) {
      temp.push("黑眼圈:色素型黑眼圈")
    } else if (result.dark_circle.value == 2) {
      temp.push("黑眼圈:血管型黑眼圈")
    } else if (result.dark_circle.value == 3) {
      temp.push("黑眼圈:阴影型黑眼圈")
    }
    if (result.eye_pouch.value == 0) {
      temp.push("眼袋:没有")
    } else {
      temp.push("眼袋:存在")
    }
    if (result.forehead_wrinkle.value == 0) {
      temp.push("抬头纹:没有")
    } else {
      temp.push("抬头纹:存在")
    }
    if (result.crows_feet.value == 0) {
      temp.push("鱼尾纹:没有")
    } else {
      temp.push("鱼尾纹:存在")
    }
    if (result.eye_finelines.value == 0) {
      temp.push("眼底细纹:没有")
    } else {
      temp.push("眼底细纹:存在")
    }
    if (result.glabella_wrinkle.value == 0) {
      temp.push("眉间纹:没有")
    } else {
      temp.push("眉间纹:存在")
    }
    if (result.nasolabial_fold.value == 0) {
      temp.push("法令纹:没有")
    } else {
      temp.push("法令纹:存在")
    }
    if (result.pores_forehead.value == 0) {
      temp.push("前额毛孔粗大:没有")
    } else {
      temp.push("前额毛孔粗大:存在")
    }
    if (result.pores_left_cheek.value == 0) {
      temp.push("左脸颊毛孔粗大:没有")
    } else {
      temp.push("左脸颊毛孔粗大:存在")
    }
    if (result.pores_right_cheek.value == 0) {
      temp.push("右脸颊毛孔粗大:没有")
    } else {
      temp.push("右脸颊毛孔粗大:存在")
    }
    if (result.pores_jaw.value == 0) {
      temp.push("下巴毛孔粗大:没有")
    } else {
      temp.push("下巴毛孔粗大:存在")
    }
    this.setData({
      skin1: temp,
      skin_check: true
    })


  },

  identifying() {
    // console.log("监听")
    if (this.data.facialfeatures_check && this.data.skin_check) {
      wx.hideLoading()
      clearInterval(this.timer)
      this.alertsuccess("识别成功！")
      this.save_history()
    }
  },
  timeouting() {
    if (this.data.facialfeatures_check && this.data.skin_check) {
      return
    }

    if (this.data.facialfeatures_check) {
      this.setData({
        currentTab: 0
      })
    } else {
      this.setData({
        currentTab: 1
      })
    }
    // console.log("自动清除")
    wx.hideLoading()
    clearInterval(this.timer)
    this.save_history()
  },
  getPosters(e) {
    // console.log(e)
    if (e.currentTarget.dataset.kind == "facialfeatures") {
      wx.navigateTo({
        url: '../skinshow/skinshow?list=' + encodeURIComponent(JSON.stringify(this.data.facialfeatures1)) + "&pic=" + this.data.pre,
      })
    } else {
      wx.navigateTo({
        url: '../skinshow/skinshow?list=' + encodeURIComponent(JSON.stringify(this.data.skin1)) + "&pic=" + this.data.pre,
      })
    }

  },
  beautify_save() {
    // console.log("save")
    var manager = wx.getFileSystemManager();
    var that = this
    manager.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/pic' + ".png",
      data: this.data.beautify_base64,
      encoding: "base64",
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/pic' + ".png",
          success: function(res) {
            that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail: function(res) {
            that.alertfail("保存失败")
            // console.log(res)
          }
        })
      }
    })

  },

  tipshow() {
    var that = this
    if (this.data.tipshowcheck) {
      this.setData({
        tipshowcheck: !this.data.tipshowcheck
      })
      this.animate(".content", [{
          bottom: "50px",
          width: "10px",
          opacity: "0"
        },
        {
          bottom: "75px",
          width: "80px",
          opacity: "0.1"
        },
        {
          bottom: "100px",
          width: "150px",
          opacity: "1"
        }
      ], 1000, function() {
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
      this.animate(".content", [{
          bottom: "100px",
          width: "150px",
          opacity: "1"
        },
        {
          bottom: "75px",
          width: "80px",
          opacity: "0.1"
        },
        {
          bottom: "50px",
          width: "10px",
          opacity: "0"
        },
      ], 1000, function() {
        that.setData({
          tipshowcheck: true,
          tipclosecheck: !that.data.tipclosecheck
        })
      })
    }
  },

  // action() {
  //   this.tipshow()
  //   setTimeout(this.tipclose, 2000)
  // },
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
    var jsondata = {}
    jsondata.pic = pic_base64
    jsondata.skin = this.data.skin1
    jsondata.facialfeatures=this.data.facialfeatures1
    var array = wx.getStorageSync("skin") || []
    array.unshift(jsondata)
    wx.setStorageSync("skin", array);
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
    // console.log(file)
    // console.log(temp['skin'])
    that.setData({
     pre:file,
      skin1: temp['skin'],
      facialfeatures1:temp['facialfeatures']
    })
    if (temp['facialfeatures'][0]!="识别不出五官，请重新选择图片"){
      that.setData({
        facialfeatures_check:true
      })
    }else{
      that.setData({
        facialfeatures_check: false
      })
    }
    if (temp['skin'][0] !='识别不出皮肤，请重新选择图片'){
      that.setData({
        skin_check:true
      })
    }else{
      that.setData({
        skin_check: false
      })
    }
    if (that.data.facialfeatures_check) {
      that.setData({
        currentTab: 0
      })
    } else {
      that.setData({
        currentTab: 1
      })
    }





  },
  get_history_list() {
    var history_list = wx.getStorageSync("skin")
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