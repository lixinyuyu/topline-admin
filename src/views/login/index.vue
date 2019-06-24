<template>
<div class="login-wrap">
    <div class="login-form-wrap">
      <!-- 头部 -->
      <div class="login-head">
        <img src="./logo_index.png" alt="">
      </div>
      <div class="login-form">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
          <el-form-item  prop="mobile" placeholder="手机号">
            <el-input type="text" v-model="ruleForm.mobile"></el-input>
          </el-form-item>
          <el-form-item  prop="code" placeholder="验证码">
            <el-col :span="10">
              <el-input type="text" v-model="ruleForm.code"></el-input>
            </el-col>
            <el-col :span="10" :offset="2">
              <!-- <el-button type="primary" @click="handleGetCode">获取验证码</el-button> -->
              <!-- 知识点：转化为bool值 -->
              <el-button type="primary" @click="handleGetCode" :disabled="!!timer || codeDisabled">{{timer ? `还有${setTime}秒`: '获取验证码'}}</el-button>
            </el-col>
          </el-form-item>
          <!-- 同意协议 -->
          <el-form-item prop="agree">
            <el-checkbox v-model="ruleForm.agree">请同意该协议</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button class="btn-login" @click="handleLogin" :loading="load">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</div>

</template>

<script>
import axios from 'axios'
import '@/vendor/gt.js'
const initCodeSeconds = 60
export default {
  name: 'AppLogin',
  data () {
    return {
      ruleForm: {
        mobile: '15536549421',
        code: '',
        agree: ''
      },
      rules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { len: 11, message: '长度为11位数', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '长度为6位数', trigger: 'blur' }
        ],
        agree: [
          { required: true, message: '请同意该协议', trigger: 'change' },
          { pattern: /true/, message: '请同意该协议', trigger: 'change' }
        ]
      },
      load: false,
      captchaObj: null,
      timer: null,
      setTime: initCodeSeconds,
      sendMobile: '',
      codeDisabled: false
    }
  },
  methods: {
    // 【功能一：得到验证码】
    // 思路：1. 点击获取验证码按钮发送axios请求，得到验证码初始化的参数
    //      2. 得到参数之后，根据initGeetest暴露出来的函数，进行配置初始化（initGeetest第一个参数）
    handleGetCode () {
      // 【功能：检验手机号是否有效】
      // 在这里检验手机号是否有效
      // 这里用到的是对部分表单校验的方法
      // 1.对获取验证码按钮设置点击事件，在发送axios请求之前，对手机号这个表单进行验证
      // 2.验证通过的话再去调用axios发请求
      this.$refs['ruleForm'].validateField('mobile', errorMessage => {
        // 如果这里的报错信息>0的话，那么就不执行,否则的话就去发送axios请求，初始化验证码
        if (errorMessage.trim().length > 0) {
          return false
        }
        // 这里应该把调用函数写在这里
        // 如果现在已经初始化了的，再去判断手机号是否相同，否则就去初始化
        if (this.captchaObj) {
          if (this.ruleForm.mobile !== this.sendMobile) {
            console.log('不等于')
            // 标记：删除
            document.body.removeChild(document.querySelector('.geetest_panel'))
            // 如果不等于的话，就初始化
            this.showGeetest()
          } else {
            this.captchaObj.verify()
          }
        } else {
          console.log('没有')
          this.showGeetest()
        }
      })
    },
    // 初始化验证码
    showGeetest () {
      // 如果有验证信息的话，就显示并且返回
      // if (this.captchaObj) {
      //   return this.captchaObj.verify()
      // }
      this.codeDisabled = true
      axios({
        method: 'GET',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${this.ruleForm.mobile}`
      }).then(res => {
        const data = res.data.data
        // 注意：这里的window是小写的
        window.initGeetest({
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: true,
          product: 'bind'
        }, (captchaObj) => {
          console.log(captchaObj)
          // 这里表示验证码初始化完成了
          this.captchaObj = captchaObj
          captchaObj.onReady(() => {
          // 初始化完成之后，将手机号保存，这里是赋值，标记bug
            this.sendMobile = this.ruleForm.mobile
            captchaObj.verify()
            this.codeDisabled = false
          }).onSuccess(() => {
            console.log(captchaObj.getValidate())
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate
            } = captchaObj.getValidate()
            // 发送第二次axios请求
            axios({
              method: 'GET',
              url: `http://ttapi.research.itcast.cn/mp/v1_0/sms/codes/${this.ruleForm.mobile}`,
              params: {
                challenge,
                seccode,
                validate
              }
            }).then(res => {
              console.log(res)
              // 发送验证码了
              this.handlesetTime()
            })
          })
        })
      })
    },
    // 功能二：表单验证
    handleLogin () {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) {
          return false
        }
        // 表单验证通过的话，就发送axios请求，登录，这里将其登录功能封装成一个函数
        this.submitLogin()
      })
    },
    submitLogin () {
      this.load = true
      axios({
        method: 'POST',
        url: 'http://ttapi.research.itcast.cn/mp/v1_0/authorizations',
        data: this.ruleForm
      }).then(res => {
        // 登录成功后，将信息放进本地存储
        window.localStorage.setItem('user_info', JSON.stringify(res.data.data))
        this.$message({
          message: '登录成功',
          type: 'success'
        })
        this.load = false
        this.$router.push({
          name: 'home'
        })
      }).catch(err => {
        if (err.response.status === 400) {
          this.$message.error('登录失败，手机号或者验证码错误')
        }
        this.load = false
      })
    },
    // 功能：点击发送验证码按钮，开启倒计时功能
    handlesetTime () {
      this.timer = window.setInterval(() => {
        this.setTime--
        if (this.setTime <= 0) {
          this.setTime = initCodeSeconds
          // 不仅要清除定时器，标识符也要清除
          window.clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped>
.login-wrap {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('./login_bg.jpg') no-repeat center;
  .login-form-wrap {
    padding: 50px;
    background-color: #fff;
    .login-head {
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 200px;
        margin-bottom: 20px;
      }
    }
    .login-form {
      .btn-login {
        width: 100%;
      }
    }
  }
}
</style>
