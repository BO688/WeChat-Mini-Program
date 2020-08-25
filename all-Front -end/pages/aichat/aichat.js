// pages/aichat/aichat.js
var plugin = requirePlugin("chatbot")
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    plugin.init({
      appid: "25MXnDGiVGcPZu82r9Uf5vvKsxzcnp",
      success: () => { console.log("成功")},
      fail: error => { console.log("失败") },
      guideList: ["今天天气好吗？","有什么好看的电影吗？","你叫什么名字？"],
      textToSpeech: true, //默认为ture打开状态
      welcome: "请问有什么需要帮助？",
      welcomeImage: 'http://inews.gtimg.com/newsapp_bt/0/10701537095/1000',
      background: "rgba(247,251,252,1)",
      guideCardHeight: 40,
      operateCardHeight: 75,
      history: true,
      historySize: 60,
      navHeight: 0,
      robotHeader: 'https://res.wx.qq.com/mmspraiweb_node/dist/static/miniprogrampageImages/talk/leftHeader.png',
      userHeader: 'https://res.wx.qq.com/mmspraiweb_node/dist/static/miniprogrampageImages/talk/rightHeader.png',
      userName: '',
      defaultWheel: ''
    });
  },
  // goBackHome回调 返回上一级页面
  goBackHome: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  // getQueryCallback回调, 返回数据
  getQueryCallback: function (e) {
  },
  // 点击机器人回答里的链接跳转webview,需要开发者自己配置一个承载webview的页面,url字段对应的小程序页面需要开发者自己创建
  // 开发者需要在小程序后台配置相应的域名
  // 1.1.7版本开始支持
  openWebview: function (e) {
    let url = e.detail.weburl
    wx.navigateTo({
      url: `/pages/webviewPage/webviewPage?url=${url}`
    })
  },
  // 点击机器人回答中的小程序，需要在开发者自己的小程序内做跳转
  // 开发者需要在小程序配置中指定跳转小程序的appId
  // 1.1.7版本开始支持
  openMiniProgram(e) {
    let { appid, pagepath } = e.detail
    wx.navigateToMiniProgram({
      appId: appid,
      path: pagepath,
      extraData: {
      },
      envVersion: '',
      success(res) {
        // 打开成功
      }
    })
  }

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  ,onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  onShareAppMessage: function () {

  }
})