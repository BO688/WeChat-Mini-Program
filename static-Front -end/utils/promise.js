/** 
* Promise化小程序接口 
*/

class Wechat {
  /** 
  * 登陆 
  * @return {Promise}  
  */
  static login() {
    return new Promise((resolve, reject) => wx.login({ success: resolve, fail: reject }));
  };
  static imgcheck(access_token,file) {
    var app = getApp();
    return new Promise((resolve, reject) => wx.uploadFile({
      url: app.globalData.request_url+'/img_sec_check',
      filePath: file,
      name: 'file',
      formData: {
        "file": file
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "access_token": access_token
      },
      success: function (data) {
        resolve(data)
       console.log(data)
      },
      fail: function (data) {
        reject(data)
        console.log(data)
      }

    }));
  };
  /** 
  * 获取用户信息 
  * @return {Promise}  
  */
  static getUserInfo() {
    return new Promise((resolve, reject) => wx.getUserInfo({ success: resolve, fail: reject }));
  };

};

module.exports = Wechat;  