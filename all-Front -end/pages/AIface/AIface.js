// pages/cartoon/cartoon.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tipshowcheck:true,
    tipclosecheck: true,
    pre:null,
    template:null,
    detect1:null,
    detect2: null,
    detect3: null,
    detect4: null,
    detect5: null,
    detect_check:false,
    height_percent:null,
    width_percent: null,
    facialfeatures_check:false,
    facialfeatures1:null,
   beautify_base64:null,
   beautify_check:false,
    skin_check:false,
    skin1: null,
    face_merge:null,
    face_template:null,
    change_ai_base64:null,
    change_ai_error:null,
    nav: [{
      name: '脸部识别'
    }, {
      name: '皮肤情况'
      }, {
        name: '五官分析'
      }, {
        name: '人脸融合'
      },{
        name:'美颜'
      }],
    currentTab: 0,//0是脸部识别 1是脸部情况 2五官分析 3人脸融合
  timeout: false,
  },
  imgpre() {
    this.setData({
      timeout: false
    })
  },
  swichNav: function (e) {
    var that = this;
    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur,
      })
      if(this.data.currentTab==4){
        this.setData({
          timeout: true
        })
        setTimeout(this.imgpre, 7000)
      }
    }
  },
  onReady(){
    
  },
  draw_a_rect(left,top,width,height,num){
    wx.createSelectorQuery()
      .select('#mycanvas')
      .node()
      .exec((res) => {
        var context = res[0].node.getContext('2d')
        // context.scale(1, 1);
        context.strokeStyle = "#00ff00"
        context.lineWidth = 2
        context.font = "40px Calibri";
        context.fillText(num,left+width/2.0,top+height/2.0)
        context.rect(left, top, width, height)
        context.stroke()
      });
  }, 
  clearcanvas() {
    
   
    wx.createSelectorQuery()
      .select('#mycanvas')
      .node()
      .exec((res) => {
        var ctx = res[0].node.getContext('2d')
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 200000, 200000);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      });
        
        
     
  },
  onShow(){
    this.action()
  },
  choose() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        // console.log(res)
        const tempFilePaths = res.tempFilePaths
        // console.log(res.tempFiles[0].size);
        
        if (res.tempFiles[0].size >= 2097152) {
          that.alertfail("请选择小于2MB的图片")
        }else{
          wx.showLoading({
            title: '正在识别',
          })
          that.setData({
            pre:tempFilePaths
          })
          that.timer=setInterval(that.identifying,1000);
          setTimeout(that.timeouting,6000);
          that.detect_send_url_with_img("https://www.hhb688.cn/face_detect", tempFilePaths[0])
          that.beautify_send_url_with_img("https://www.hhb688.cn/face_beautify", tempFilePaths[0])
          that.skin_send_url_with_img("https://www.hhb688.cn/face_skin", tempFilePaths[0])
          that.facialfeatures_send_url_with_img("https://www.hhb688.cn/face_facialfeatures",tempFilePaths[0])
          
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  
  choose_template(){
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res)
        const tempFilePaths = res.tempFilePaths
        // console.log(res.tempFiles[0].size);

        if (res.tempFiles[0].size >= 2097152) {
          that.alertfail("请选择小于2MB的图片")
        } else {
          
          that.setData({
            template: tempFilePaths
          })


        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }
  ,
  detect_send_url_with_img(url,img) {
    var that = this
    
    wx.uploadFile({
      url: url,
      filePath: img,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (data) {
        
        if (data.statusCode != 200||data.data=="") {
          that.setData({
            detect_check:false
          })
          that.alertfail('脸部识别超时')
          return 
        } else {
          that.face_detect(JSON.parse(data.data))
       
        }


      }, fail: function (data) {
       
        console.log(data)
        that.setData({
          detect_check: false
        })
        that.alertfail('脸部识别超时')
      }
    })
  }
  ,
  imageLoad: function (e) {
    var $width = e.detail.width; //获取图片真实宽度
    var $height = e.detail.height; //获取图片真实高度
    this.setData({
      width_percent: 200.00/$width,
      height_percent: 200.00/$height
    })
    console.log(this.data.width_percent)
  },
  alertfail(text) {
    this.action()
    wx.showToast({
      title: text,
      image: "../pic/fail.png",
      duration: 2000
    })
  }, alertsuccess(text) {
    this.action()
    wx.showToast({
      title: text,
      image: "../pic/success.png",
      duration: 2000
    })
  },
  face_detect(data){
    this.setData({
      detect1: null,
      detect2: null,
      detect3: null,
      detect4: null,
      detect5: null,
      detect_check:false
    })
    this.clearcanvas();
    // console.log(data)
    if(data==null||data==undefined||data==""||data.face_num==0||data.error!=undefined)
    {
      var temp=[]
      temp.push("识别不出脸部，请重新选择图片")
      this.setData({
        detect1:temp
      })
      
      return;}
    else{
      var facearray=data.faces;
      // console.log(facearray)
      for(var x in facearray){
        var temp = []
        console.log(x)
        
       
        var left = facearray[x].face_rectangle.left * (this.data.width_percent+0.09)
        var top = facearray[x].face_rectangle.top * (this.data.height_percent-0.09)
        var width= facearray[x].face_rectangle.width*(this.data.width_percent+0.03)
        var height=facearray[x].face_rectangle.height*(this.data.height_percent-0.03)
        
        this.draw_a_rect(left,top,width,height,Number( x)+1)
        
        var  attribute = facearray[x].attributes
        //word
        if (attribute.gender.value == "Female") {//gender
          console.log(attribute.beauty.female_score)
          temp.push("你的颜值：" + attribute.beauty.female_score)
        } else {
          temp.push("你的颜值：" + attribute.beauty.male_score)
          console.log(attribute.beauty.male_score)
        }
        temp.push("你的年龄：" + attribute.age.value)
        console.log(attribute.age.value)
        temp.push("脸部情况：")
        for(var y in attribute.skinstatus){
         
          if (y=="dark_circle"){
            temp.push("黑眼圈:" + attribute.skinstatus[y])
          } else if (y == "acne") {
            temp.push("青春痘:" + attribute.skinstatus[y])
          } else if (y == "health") {
            temp.push("健康:" + attribute.skinstatus[y])
          } else if (y=="stain"){
            temp.push("色斑:" + attribute.skinstatus[y])
          }
          
        }
     
        temp.push("超过"+attribute.smile.threshold+"为微笑:你的得分是" + attribute.smile.value)
        temp.push("表情成分：")
        for(var z in attribute.emotion){
          
          if(z=="surprise"){
            temp.push( "惊讶:" + attribute.emotion[z])
          } else if (z == "happiness") {
            temp.push("高兴:" + attribute.emotion[z])
          } else if (z == "neutral") {
            temp.push("中性:" + attribute.emotion[z])
          } else if (z == "sadness") {
            temp.push("悲伤:" + attribute.emotion[z])
          }else if (z == "disgust") {
            temp.push("疑惑:" + attribute.emotion[z])
          } else if (z == "anger") {
            temp.push("生气:" + attribute.emotion[z])
          } else if (z == "fear") {
            temp.push("害怕:" + attribute.emotion[z])
          } 
        }

        if (x == 0) {
          this.setData({
            detect1: temp,
            detect_check:true
          })
        }
        if (x == 1) {
          this.setData({
            detect2: temp
          })
        }
        if (x == 2) {
          this.setData({
            detect3: temp
          })
        }
        if (x == 3) {
          this.setData({
            detect4: temp
          })
        }
        if (x == 4) {
          this.setData({
            detect5: temp
          })
        }
      }
      
     
    }
      }
      ,
  facialfeatures(data){
    this.setData({
      facialfeatures1: null,
      facialfeatures_check: false,
    })
    var temp = []
    if (data == "" || JSON.parse(data).error!=undefined){
      
      temp.push("识别不出五官，请重新选择图片")
      this.setData({
        facialfeatures1:temp
      })
      return ;
    }
    var data=JSON.parse(data)
    var result = data.result
    // console.log(result)
    if (result.eyebrow.eyebrow_type =="bushy_eyebrows"){
      temp.push("眉型:粗眉")
    } else if (result.eyebrow.eyebrow_type == "eight_eyebrows"){
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
      facialfeatures1:temp,
      facialfeatures_check:true
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
      success: function (data) {
       

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
      }, fail: function (data) {
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
      success: function (data) {
        if (data.statusCode != 200) {
          that.alertfail('皮肤分析超时')
          that.setData({
           skin_check: false
          })
          return
        } else {          
          that.skin(data.data)
        }
      }, fail: function (data) {
        that.setData({
          skin_check: false
        })
        that.alertfail('皮肤分析超时')
      }
    })
  },
  skin(data){
    this.setData({
      skin1: null,
      skin_check: false,
    })
    var temp = []
    if (data == ""||JSON.parse(data).error != undefined) {

      temp.push("识别不出皮肤，请重新选择图片")
      this.setData({
        skin1: temp
      })
      return;
    }

    var data=JSON.parse(data)
    var result=data.result
    // console.log(data)
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
  
    if(result.blackhead.value==0){
         temp.push("黑头:没有")
    } else if(result.blackhead.value == 1){
      temp.push("黑头:轻度")
    } else if (result.blackhead.value == 2) {
      temp.push("黑头:中度")
    } else if (result.blackhead.value == 3) {
      temp.push("黑头:重度")
    }
    if (result.dark_circle.value == 0) {
      temp.push("黑眼圈:没有")
    } else if (result.dark_circle.value == 1){
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
  beautify_send_url_with_img(url, img) {
    var that = this
    wx.uploadFile({
      url: url,
      filePath: img,
      name: 'file',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (data) {
        if (data.statusCode != 200) {
          that.alertfail('美颜超时')
          that.setData({
            beautify_check: false
          })
          return
        } else {
          that.beautify(data.data)
        }
      }, fail: function (data) {
        that.setData({
          beautify_check: false
        })
        that.alertfail('美颜超时')
      }
    })
  },
  beautify(data){
    // console.log(data);
    try{
    var result=JSON.parse(data).result;
    this.setData({
      beautify_base64: result.replace(/[\r\n]/g, ""),
      beautify_check:true,
      timeout: true
    })
      setTimeout(this.imgpre, 7000)
    }
    catch(E){
      this.setData({
        beautify_check: false
      })
    }
    
  },
  identifying(){
    console.log("监听")
    if(this.data.beautify_check&&this.data.detect_check&&this.data.facialfeatures_check&&this.data.skin_check){
      wx.hideLoading()
      clearInterval(this.timer)
      this.alertsuccess("识别成功！")
    }
  },
  timeouting(){
    this.action()
    console.log("自动清除")
    wx.hideLoading()
    clearInterval(this.timer)
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
            that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail: function (res) {
            that.alertfail("保存失败")
            // console.log(res)
          }
        })
      }
    })

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
          success: function (res) {
            that.alertsuccess("保存成功")
            // console.log(res)
          },
          fail: function (res) {
            that.alertfail("保存失败")
            // console.log(res)
          }
        })
      }
    })

  },
  ai_change_face(){
    var that = this
    wx.showLoading({
      title: 'AI正在转换',
    })
    that.setData({
      change_ai_error: null
    })
    wx.uploadFile({
      url: "https://www.hhb688.cn/face_merge",
      filePath: that.data.pre[0],
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
          var result=JSON.parse(data.data)
          that.setData({
            face_merge : result.result
          })
          
        }
      }, fail: function (data) {
        that.alertfail('人脸融合超时')
        return
      }
    })
    wx.uploadFile({
      url: "https://www.hhb688.cn/face_template",
      filePath: that.data.template[0],
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
            face_template : result.result
          })
          
        }
      }, fail: function (data) {
        that.alertfail('人脸融合超时')
        return
      }
    })
    this.timer_wait_pic=setInterval(this.wait_pic,1000)
  },
  tipshow() {
    var that=this
    if(this.data.tipshowcheck){
      this.setData({
        tipshowcheck: !this.data.tipshowcheck
      })
      this.animate(".content", [
        { bottom: "50px",width: "10px", opacity: "0" },
        { bottom: "75px",width: "80px", opacity: "0.1" },
        { bottom: "100px",width: "150px", opacity: "1" }
      ], 1000,function(){
        that.setData({
          tipshowcheck: !that.data.tipshowcheck
        })
      })
    }
    
  },
  tipclose() {
    var that=this
    if(this.data.tipclosecheck){
      this.setData({
        tipclosecheck: !this.data.tipclosecheck
      })
    this.animate(".content", [
      { bottom: "100px",width: "150px", opacity: "1" },
      { bottom: "75px", width: "80px", opacity: "0.1" },
      { bottom: "50px", width: "10px", opacity: "0" },
    ], 1000,function(){
      that.setData({
        tipshowcheck:true,
        tipclosecheck: !that.data.tipclosecheck
      })
    })
    }
  },
  wait_pic(){
    var that=this
    
    if (this.data.face_merge!=null&&this.data.face_template!=null){
      wx.hideLoading();
    console.log(this.data.face_merge, this.data.face_template)
    wx.request({
      url: 'https://www.hhb688.cn/wx_face_mergeface', //仅为示例，并非真实的接口地址
      data: {
        'merge_face': this.data.face_merge,
        'feature_face': this.data.face_template
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if(res.data.result==undefined){
          that.setData({
            change_ai_error:"AI换脸失败请重新选择带有人脸的图片！" 
          })
          return
        }
        that.setData({
          change_ai_base64:res.data.result
        })
        that.alertsuccess("转换成功！")
       
        
      }
    })
      clearInterval(this.timer_wait_pic)
    }
  },
  action(){
    this.tipshow()
    setTimeout(this.tipclose,2000)
  },
  onShareAppMessage(){
    
  }
  
})