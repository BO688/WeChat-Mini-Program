//app.js
// var pluginaichat = requirePlugin("chatbot")

App({
  
  onLaunch: function () {
    // pluginaichat.init({
    //   appid: "25MXnDGiVGcPZu82r9Uf5vvKsxzcnp",
    //   // openid:"wx8c631f7e9f2465e1"
    // })
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  
  globalData: {
    song:null,
    userInfo: null,
    musiclist: ["Ailee - I Will Show You", "Ashworth - Second Guess (Extended Mix)", "Baby Alice - Pina Colada Boy", "Bad Style - Time Back", "Bea Miller - Paper Doll", "Blue Stahli - Fierce Pop Starlet", "Blue Stahli - Glitterati", "Blue Stahli - Leadfoot Getaway", "Cash Cash - History", "Charlotte Lawrence - Just The Same", "cinnamons,evening cinema - summertime", "Cosmos & Creature - Young", "Coyote Kisses - Six Shooter", "Cuurley,Sophia Fredskild - Go", "D!avolo,Colin & Caroline - Fall", "DAOKO,米津玄師 - 打上花火", "Diviners,Nostalg1a - Don't Blame", "DU丢丢丢,杏Kyou - some（Cover 昭宥／郑基高）", "Ehrling - Champagne Ocean", "Fly by Midnight - Vibe", "Gandzhu - Your Motivation", "Gjan - Confidence", "High Dive Heart - Misfit", "HYE SUNG,Lauv - Paris In The Rain (HYE SUNG Remix)", "Jacob Tillberg - Broken", "Jawster,Lilianna Wilde - Grind Me Down (Jawster Remix)", "Lil Angel Boi - Close Your Eyes", "Mabanua - Megalobox", "Marc May - When it's all over", "Max Oazo,OJAX - Got Everything", "Mich - Somero", "NEFFEX - Fight Back", "Neru,鏡音リン,鏡音レン - 病名は愛だった", "Niykee Heaton - Villa", "ONE OK ROCK - Re：make", "Pavla - One Million Butterflies", "Shawn Wasabi,Pusher,Mothica - Clear (Shawn Wasabi Remix)", "Simon Viklund - Backstab", "SNBRN,Andrew Watt - Beat The Sunrise (Cavego Remix)", "Stalking Gia - Second Nature", "Starset - My Demons", "Super Junior - U (Chinese Version)", "SWIN - 只因你太美", "The Glitch Mob,Mako,The Word Alive - RISE", "ThimLife,Bibiane Z - Another You", "Tim Legend - soda city funk", "Tim Urban - Perfectly You", "Truslow - Send Me Away", "Various Artists - Smash It Up", "Voicians - Empire", "X-Change,nicci - The Last Time", "еяхат музыка - Dependent", "陈姿彤 - 我的世界", "黒うさP,初音ミク - 千本桜", "黑崎子 - bbibbi（英语男声翻唱）（Cover：李知恩IU）", "黑崎子 - 孤身（温柔男声版）（Cover：徐秉龙）", "菅野祐悟 - il vento d'oro", "靠近", "浪子康,豪大大 - 丁当-猜不透（弹鼓版）（浪子康 ／ 豪大大 remix）", "冷筱宇 - Vexento-trippy love +najia bootleg（冷筱宇 remix）", "洛尘鞅_vvv - 最后一页（Cover：江语晨）", "毛毛 - 奇迹再现", "祁圣翰 - 说好了", "王霏霏（Fei）,GenNeo梁根荣 - 零落成辉", "许嵩 - 雅俗共赏", "薛之谦 - 骆驼", "薛之谦 - 慢半拍", "虞霞,李小龙 - 侠客行", "张大仙 - 最强王者参见"]
  }
})