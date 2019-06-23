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
              <el-button type="primary" @click="handleGetCode">获取验证码</el-button>
            </el-col>
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
export default {
  data () {
    return {
      ruleForm: {
        mobile: '15536549421',
        code: ''
      },
      rules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { len: 11, message: '长度为11位数', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '长度为6位数', trigger: 'blur' }
        ]
      },
      load: false
    }
  },
  methods: {
    // 功能一：得到验证码
    // 思路：1. 点击获取验证码按钮发送axios请求，得到验证码初始化的参数
    //      2. 得到参数之后，根据initGeetest暴露出来的函数，进行配置初始化（initGeetest第一个参数）
    handleGetCode () {
      const { mobile } = this.ruleForm
      // 如果有验证信息的话，就显示并且返回
      if (this.captchaObj) {
        return this.captchaObj.verify()
      }
      axios({
        method: 'GET',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
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
          this.captchaObj = captchaObj
          captchaObj.onReady(() => {
            captchaObj.verify()
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
