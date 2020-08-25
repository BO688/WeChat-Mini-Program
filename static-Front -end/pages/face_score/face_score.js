const wechat = require('../../utils/promise.js');
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {

    access_token: app.globalData.access_token,
    tipshowcheck: true,
    tipclosecheck: true,
    pre: null,
    detect1: null,
    detect_check: false,
    beautify_base64: null,
    beautify_check: false,
    timeout: false,
    tip: false,
    show:false,
    history_check: true,
    history_list: [],
   

  },
  imgpre() {
    this.setData({
      timeout: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {


  },
  getPoster() {
    try{
      wx.navigateTo({
        url: '../Test/Test?list=' + encodeURIComponent(JSON.stringify(this.data.detect1)) + "&pic=" + this.data.pre,
      })
    }catch(e){
    }
 
  },
  onShow() {
    var fsm=wx.getFileSystemManager()
  var  path=wx.env.USER_DATA_PATH
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
  identifying() {
    // console.log("监听")
    if (this.data.beautify_check && this.data.detect_check) {
      var tempjson = {}
      tempjson.result = this.data.detect1
      this.save_history(tempjson)
      wx.hideLoading()
      clearInterval(this.timer)
      this.alertsuccess("识别成功！")
      this.tipshow()
    }
  },
  timeouting() {
    if (this.data.beautify_check && this.data.detect_check) {
      return
    }
    // this.alertfail("网络超时")
    wx.hideLoading()
    clearInterval(this.timer)
    var tempjson = {}
    tempjson.result = this.data.detect1
    this.save_history(tempjson)
    if (this.data.beautify_check && this.data.detect_check) {
      this.tipshow()
    }

  },
  choose() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '正在加载中',
        })

        // console.log(res)
        const tempFilePaths = res.tempFilePaths
        // console.log(res.tempFiles[0].size);

        if (res.tempFiles[0].size >= 2097152) {
          that.alertfail("请选择小于2MB的图片")
        } else {
          
          wx.compressImage({
            src: tempFilePaths[0], // 图片路径
            quality: 50, // 压缩质量
            success: function(data) {

              wechat.imgcheck(that.data.access_token, data.tempFilePath).then(d => {
                // console.log(d.data)
                if (JSON.parse(d.data).errmsg == "ok") {
                  that.setData({
                    history_pic: null,
                    pre: tempFilePaths[0]
                  })
                  that.timer = setInterval(that.identifying, 1000);
                  setTimeout(that.timeouting, 7000);
                  that.detect_send_url_with_img(app.globalData.request_url+"/face_detect", tempFilePaths[0])
                  that.beautify_send_url_with_img(app.globalData.request_url+"/face_beautify", tempFilePaths[0])

                } else {
                  // console.log("敏感")
                  that.alertfail("敏感图片!")

                }
              }).catch(e => {
                console.log(e);
              })
            }
          })

        }
      },
      fail: function(res) {
        console.log(res)
      }
    })
  },
  detect_send_url_with_img(url, img) {
    var that = this

    wx.uploadFile({
      url: url,
      filePath: img,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function(data) {

        if (data.statusCode != 200 || data.data == "") {
          that.setData({
            detect_check: false
          })
          that.alertfail('识别超时')
          return
        } else {
          that.face_detect(JSON.parse(data.data))

        }


      },
      fail: function(data) {

        console.log(data)
        that.setData({
          detect_check: false
        })
        that.alertfail('识别超时')
      }
    })
  },
  alertfail(text) {

    wx.showToast({
      title: text,
      image: "../pic/fail.png",
      duration: 2000
    })
  },
  alertsuccess(text) {
    wx.showToast({
      title: text,
      image: "../pic/success.png",
      duration: 2000
    })

  },
  face_detect(data) {
    this.setData({
      detect1: null,
      detect_check: false
    })
    if (data == null || data == undefined || data == "" || data.face_num == 0 || data.error != undefined) {
      this.alertfail("请重新选择")
      var temp = []
      temp.push("识别不出脸部，请重新选择图片")
      this.setData({
        detect1: temp
      })

      return;
    } else {
      var facearray = data.faces;
      // console.log(facearray)
      for (var x in facearray) {
        var temp = []
        // console.log(x)


        var left = facearray[x].face_rectangle.left * (this.data.width_percent + 0.09)
        var top = facearray[x].face_rectangle.top * (this.data.height_percent - 0.09)
        var width = facearray[x].face_rectangle.width * (this.data.width_percent + 0.03)
        var height = facearray[x].face_rectangle.height * (this.data.height_percent - 0.03)


        var attribute = facearray[x].attributes
        //word
        var scoreABC
        temp.push("我的颜值测试")
        if (attribute.gender.value == "Female") { //gender
          console.log(attribute.beauty.female_score)
          scoreABC = attribute.beauty.female_score
          temp.push("颜值：" + attribute.beauty.female_score)
        } else {
          scoreABC = attribute.beauty.male_score
          temp.push("颜值：" + attribute.beauty.male_score)
          console.log(attribute.beauty.male_score)
        }
        temp.push("年龄：" + attribute.age.value)
        // console.log(attribute.age.value)
        temp.push("脸部情况：")
        for (var y in attribute.skinstatus) {

          if (y == "dark_circle") {
            temp.push("黑眼圈:" + attribute.skinstatus[y])
          } else if (y == "acne") {
            temp.push("青春痘:" + attribute.skinstatus[y])
          } else if (y == "health") {
            temp.push("健康:" + attribute.skinstatus[y])
          } else if (y == "stain") {
            temp.push("色斑:" + attribute.skinstatus[y])
          }

        }

        temp.push("微笑值：" + attribute.smile.value)
        temp.push("表情成分：")
        for (var z in attribute.emotion) {

          if (z == "surprise") {
            temp.push("惊讶:" + attribute.emotion[z])
          } else if (z == "happiness") {
            temp.push("高兴:" + attribute.emotion[z])
          } else if (z == "neutral") {
            temp.push("中性:" + attribute.emotion[z])
          } else if (z == "sadness") {
            temp.push("悲伤:" + attribute.emotion[z])
          } else if (z == "disgust") {
            temp.push("疑惑:" + attribute.emotion[z])
          } else if (z == "anger") {
            temp.push("生气:" + attribute.emotion[z])
          } else if (z == "fear") {
            temp.push("害怕:" + attribute.emotion[z])
          }
        }
        temp.push("颜值等级")
        scoreABC = Number(scoreABC)
        // console.log(scoreABC)
        // console.log(scoreABC>=70&&scoreABC<80)
        // console.log(scoreABC>=60 && scoreABC < 70)
        if (scoreABC < 60) {
          temp.push("B")
        } else if (scoreABC >= 60 && scoreABC < 70) {
          temp.push("A")
        } else if (scoreABC >= 70 && scoreABC < 80) {
          temp.push("S")
        } else if (scoreABC >= 80 && scoreABC < 90) {
          temp.push("SS")
        } else {
          temp.push("SSS")
        }
        // console.log(temp)
        if (x == 0) {
          this.setData({
            detect1: temp,
            detect_check: true
          })
          
        }

      }


    }
  },
  beautify_send_url_with_img(url, img) {
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
          that.alertfail('美颜超时')
          that.setData({
            beautify_check: false
          })
          return
        } else {
          that.beautify(data.data)
        }
      },
      fail: function(data) {
        that.setData({
          beautify_check: false
        })
        that.alertfail('美颜超时')
      }
    })
  },
  beautify(data) {
    // console.log(data);
    try {
      var result = JSON.parse(data).result;
      this.setData({
        beautify_base64: result.replace(/[\r\n]/g, ""),
        beautify_check: true,
      })
      
    } catch (E) {
      this.setData({
        beautify_check: false
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
            // that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail: function(res) {
            // that.alertfail("保存失败")
            // console.log(res)
          }
        })
      }
    })

  },
  tipshow() {
    var that = this
    that.setData({
      tip: true
    })
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
    ], 500, function() {
      that.animate("#word", [{
          height: "35%",
          opacity: "0"
        },
        {
          opacity: "0.1"
        },
        {
          opacity: "1"
        }
      ], 500)
    })



  },
  tipclose() {
    if (this.data.tip) {
      var that = this
      that.setData({
        tip: false
      })
      this.animate("#word", [{
          height: "35%",
          opacity: "1"
        },
        {
          height: "35%",
          opacity: "0.1"
        },
        {
          height: "0%",
          opacity: "0"
        },
      ], 500, function() {
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
        ], 500, function() {
          
        })
      })
    }

  },
  show(){
    var that = this
    that.setData({
      show: true
    })
    this.animate("#bg_show", [{
      height: "100%",      opacity: "0"    },
    {      opacity: "0.1"    },
    {      opacity: "1"    }
    ], 500, function () {
      that.animate("#show", [
        {        height: "100%",        opacity: "0"},
      {        opacity: "0.1"      },
      {        opacity: "1"      }
      ], 500)
      that.animate("#show_image", [
        { height: "250px", opacity: "0" },
        { opacity: "0.1" },
        { opacity: "1" }
      ], 500,function(){
        that.setData({
          timeout: true
        })
        setTimeout(that.imgpre, 7000)
      })
    })
  },
  show_close(){
    var that = this
    that.animate("#show_image", [
      { height: "250px", opacity: "1" },
      { opacity: "0.1" },
      { height: "0px", opacity: "0" }
    ], 500,function(){
      that.animate("#show", [
        { height: "100%", opacity: "1" },
        { opacity: "0.1" },
        { height: "0%", opacity: "0" }
      ], 500,function(){
        that.animate("#bg_show", [
          { height: "100%", opacity: "1" },
          { opacity: "0.1" },
          { height: "0%", opacity: "0" }
        ], 500, function () {
          that.setData({
            show: false
          })

        }) 
      })
    })
    
  
  },
   save_history(jsondata) {
    var temppic = this.data.pre
    wx.compressImage({
      src: temppic,
      quality: 50,
      success: function (data) {
        temppic = data.tempFilePath
      }
    })
    var pic_base64 = wx.getFileSystemManager().readFileSync(temppic, "base64")
    jsondata.pic = pic_base64
    jsondata.beautify=this.data.beautify_base64
    var array = wx.getStorageSync("face_score") || []
    array.unshift(jsondata)
     wx.setStorageSync("face_score",array);
    this.get_history_list()
  },
  history_show(e) {
   
    var that = this

    var temp = this.data.history_list[e.currentTarget.dataset.index]
    var imgSrc = temp['pic']
    var save = wx.getFileSystemManager();
    var number=Math.random()
    var file = wx.env.USER_DATA_PATH + '/pic'+number + '.png'
    save.writeFile({
      filePath:file ,
      data: imgSrc,
      encoding: 'base64',
      success: res => {
        // console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
 
    if (temp['beautify']!=null){
      that.setData({
        beautify_check: true,
      })
    }else{
      that.setData({
        beautify_check: false,
      })
    }
    if (temp['result'][0] != "识别不出脸部，请重新选择图片"){
      that.setData({
        detect_check: true,
      })
    }else{
      that.setData({
        detect_check: false,
      })
    }
    // console.log(file)

     that.setData({
         pre: file,
      beautify_base64: temp['beautify'],
      detect1: temp['result'],
    })
   
    
   


  },
  get_history_list() {
    var history_list = wx.getStorageSync("face_score")
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
  , onShareAppMessage: function (res) {
    return {
      title: "AI图像助手",
      imageUrl: "../pic/family.jpg"
    };
  },
   
  


})