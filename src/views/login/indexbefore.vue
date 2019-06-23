<template>
  <div class="login-wrap">
    <div class="login-form-wrap">
      <!-- 头部 -->
      <div class="login-head">
        <img src="./logo_index.png" alt="黑马头条">
      </div>
      <!-- 表单项 -->
      <div class="login-form">
          <el-form :model="form"  ref="ruleForm" :rules="rules">
            <el-form-item placeholder="手机号" prop="mobile">
              <el-input type="text" v-model="form.mobile" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item  placeholder="验证码" prop="code">
              <el-col :span="10">
                <el-input type="text" v-model="form.code"></el-input>
              </el-col>
              <el-col :span="10" :offset="2">
                <el-button  @click="handleSendCode()">获取验证码</el-button>
              </el-col>
            </el-form-item>
            <el-form-item>
              <el-button class="btn-login" type="primary" @click="handleLogin" :loading="loginLoading">登陆</el-button>
            </el-form-item>
          </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import '@/vendor/gt'
export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '15536549421',
        code: ''
      },
      captchaObj: null,
      loginLoading: false,
      rules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { len: 11, message: '长度为11个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '长度必须为6个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 发送验证码功能
    handleSendCode () {
      const { mobile } = this.form
      console.log(mobile)
      // 处理重复验证码问题
      if (this.captchaObj) {
        return this.captchaObj.verify()
      }
      axios({
        method: 'GET',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
      }).then(res => {
        console.dir(res)
        const data = res.data.data
        console.log(data)
        window.initGeetest({
          // 配置参数
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          product: 'bind'
        }, (captchaObj) => {
          this.captchaObj = captchaObj
          console.log(this.captchaObj)
          // 验证码ready之后才能调用verify显示验证码
          captchaObj.onReady(() => {
            captchaObj.verify()
          }).onSuccess(() => {
            //
            console.log(captchaObj.getValidate())
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate
            } = captchaObj.getValidate()
            // 发送第二次axios请求
            axios({
              method: 'GET',
              url: `http://ttapi.research.itcast.cn/mp/v1_0/sms/codes/${mobile}`,
              params: {
                challenge,
                seccode,
                validate
              }
            }).then(res => {
              // 这一步就得到手机验证码了
              console.log(res)
              // 在这一步去实现倒计时效果？
            })
          })
        })
      })
    },
    // 表单验证
    handleLogin () {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) {
          return false
        }
        // 表单验证通过的话就提交
        this.submitLogin()
      })
    },
    // 登陆封装
    submitLogin () {
      this.loginLoading = true
      console.log(this.form)
      axios({
        method: 'POST',
        url: 'http://ttapi.research.itcast.cn/mp/v1_0/authorizations',
        data: this.form
      }).then(res => {
        console.log(res)
        this.$message({
          message: '登陆成功',
          type: 'success'
        })
        this.loginLoading = false
        this.$router.push({
          name: 'home'
        })
      }).catch(err => {
        if (err.response.status === 400) {
          this.$message.error('登陆失败，手机号或验证码错误')
        }
        this.loginLoading = false
      })
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
  .login-head {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 200px;
      margin-bottom: 15px;
    }
  }
  .login-form-wrap {
    background-color: #fff;
    padding: 50px;
    border-radius: 30px;
    .btn-login {
      width: 100%;
    }
  }
}
</style>
