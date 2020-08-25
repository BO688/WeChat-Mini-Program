
const wechat = require('utils/promise.js');

App({
  
  onLaunch: function () {
    this.getaccesstoken()
    setInterval(this.getaccesstoken,7200000)
 
  },
  getaccesstoken()
  {
    var that=this
   
    wx.request({
      url: this.globalData.request_url+'/wx_access_token',
      success: function (data) {
        that.globalData.access_token=data.data.access_token
        console.log(data)
      },
      fail: function (data) {
        console.log(data)
      }
    }) 
  },
  globalData: {
    request_url:"https://hhb688.cn",
    access_token:null,
    color :["#eeaea6",
      "#eeeea6",
      "#eeae66",
      "#c1eeee",
       "#C9D9FF"],
      colorindex : 0,
    song:null,
    userInfo: null,
    musiclist: ["Ailee - I Will Show You", "Ashworth - Second Guess (Extended Mix)", "Baby Alice - Pina Colada Boy", "Bad Style - Time Back", "Bea Miller - Paper Doll", "Blue Stahli - Fierce Pop Starlet", "Blue Stahli - Glitterati", "Blue Stahli - Leadfoot Getaway", "Cash Cash - History", "Charlotte Lawrence - Just The Same", "cinnamons,evening cinema - summertime", "Cosmos & Creature - Young", "Coyote Kisses - Six Shooter", "Cuurley,Sophia Fredskild - Go", "D!avolo,Colin & Caroline - Fall", "DAOKO,米津玄師 - 打上花火", "Diviners,Nostalg1a - Don't Blame", "DU丢丢丢,杏Kyou - some（Cover 昭宥／郑基高）", "Ehrling - Champagne Ocean", "Fly by Midnight - Vibe", "Gandzhu - Your Motivation", "Gjan - Confidence", "High Dive Heart - Misfit", "HYE SUNG,Lauv - Paris In The Rain (HYE SUNG Remix)", "Jacob Tillberg - Broken", "Jawster,Lilianna Wilde - Grind Me Down (Jawster Remix)", "Lil Angel Boi - Close Your Eyes", "Mabanua - Megalobox", "Marc May - When it's all over", "Max Oazo,OJAX - Got Everything", "Mich - Somero", "NEFFEX - Fight Back", "Neru,鏡音リン,鏡音レン - 病名は愛だった", "Niykee Heaton - Villa", "ONE OK ROCK - Re：make", "Pavla - One Million Butterflies", "Shawn Wasabi,Pusher,Mothica - Clear (Shawn Wasabi Remix)", "Simon Viklund - Backstab", "SNBRN,Andrew Watt - Beat The Sunrise (Cavego Remix)", "Stalking Gia - Second Nature", "Starset - My Demons", "Super Junior - U (Chinese Version)", "SWIN - 只因你太美", "The Glitch Mob,Mako,The Word Alive - RISE", "ThimLife,Bibiane Z - Another You", "Tim Legend - soda city funk", "Tim Urban - Perfectly You", "Truslow - Send Me Away", "Various Artists - Smash It Up", "Voicians - Empire", "X-Change,nicci - The Last Time", "еяхат музыка - Dependent", "陈姿彤 - 我的世界", "黒うさP,初音ミク - 千本桜", "黑崎子 - bbibbi（英语男声翻唱）（Cover：李知恩IU）", "黑崎子 - 孤身（温柔男声版）（Cover：徐秉龙）", "菅野祐悟 - il vento d'oro", "靠近", "浪子康,豪大大 - 丁当-猜不透（弹鼓版）（浪子康 ／ 豪大大 remix）", "冷筱宇 - Vexento-trippy love +najia bootleg（冷筱宇 remix）", "洛尘鞅_vvv - 最后一页（Cover：江语晨）", "毛毛 - 奇迹再现", "祁圣翰 - 说好了", "王霏霏（Fei）,GenNeo梁根荣 - 零落成辉", "许嵩 - 雅俗共赏", "薛之谦 - 骆驼", "薛之谦 - 慢半拍", "虞霞,李小龙 - 侠客行", "张大仙 - 最强王者参见"]
  },
  
})