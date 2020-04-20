<template>
    <div id="login">
       <div class="login-wrap">
            <ul class="menu-tab">
                <li v-for="(item,index) in menuTab" :key="index" :class="{'current': item.current}" @click="toggleMenu(item)">
                {{ item.text }}
                </li>
            </ul>

            <el-form :model="ruleForm" status-icon :rules="rules2" ref="FormName" class="login-form" size="medium">

            <el-form-item  prop="email" class="item-from">
                <label>邮箱</label>
                <el-input type="text" v-model="ruleForm.email" auto-complete="off"></el-input>
            </el-form-item>

            <el-form-item  prop="password" class="item-from">
                <label>密码</label>
                <el-input type="password" v-model="ruleForm.password" auto-complete="off" maxlength = '20' minlength='6'></el-input>
            </el-form-item>

             <el-form-item  prop="passwords" class="item-from" v-show ="modal === 'register'">
                <label>重复密码</label>
                <el-input type="passwords" v-model="ruleForm.passwords" auto-complete="off" maxlength = '20' minlength='6'></el-input>
            </el-form-item>


            <el-form-item  prop="repass" class="item-from">
                <label>验证码</label>
                <el-row :gutter="20">
                    <el-col :span="15"><el-input v-model="ruleForm.repass"></el-input></el-col>
                    <el-col :span="9"><el-button type="success"  class=" block" @click="getSms()"  :disabled = codeBtnStatus.status >{{codeBtnStatus.text}}</el-button></el-col>
                </el-row>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm('FormName')" class="login-btn block" :disabled = BtnStatus>{{modal == 'login'?"登录":"注册"}}</el-button>
            </el-form-item>
            </el-form>
        </div>
    </div>
</template>


<script>
import service from '@/utils/request'
import { GetSms,SignIn,Login} from '@/api/login'
import {reactive,ref,onMounted} from '@vue/composition-api'
import { stripscript , checkRegEmial ,checkRegPass,checkRegRepass} from '@/utils/reg'
import { setCookie , setUsername } from '@/utils/cookie.js'

export default {
  data(){
       /**
        * 表单校验部分
        */
      let checkEmail = (rule, value, callback) => {
          if (!value) {
            return callback(new Error('邮箱不能为空'));
          }else if( checkRegEmial(value) ){
            return callback(new Error('请输入合法的邮箱'));
          }else{
            callback();
          }
      };
      let checkPassword = (rule, value, callback) => {    //校验密码
        this.ruleForm.password = stripscript(value);
        value = this.ruleForm.password;

        if (value === '') {
          callback(new Error('请输入密码'));
        } else if(checkRegPass(value)){
              return callback(new Error('密码为6-20位数字加字母组合'));
        }else{
            callback()
        }
      };
      let checkPasswords = (rule, value, callback) => {   //校验重复密码  
       if(this.modal == 'login'){ callback() }  //使用v-if 不需要判断  使用v-show时候 需要判断
          this.ruleForm.passwords = stripscript(value);
          value = this.ruleForm.passwords;
          if (value === '') {
           callback(new Error('请输入重复密码'));
            } else if(value !=  this.ruleForm.password ){
              return callback(new Error('两次输入不一致'));
            }else{
                callback()
            }
      };
      let checkRepass = (rule, value, callback) => {  //校验验证码  
        this.ruleForm.repass = stripscript(value);
        value = this.ruleForm.repass;
        if (value === '') {
          callback(new Error('请输入验证码'));
        } else if( checkRegRepass(value)){
              return callback(new Error('请输入合法的密码'));
        }else{
            callback()
        }
      };
      return{

        //定义按钮选择
         menuTab:[
                {text:'登录',current:true,type:'login'},
                {text:'注册',current:false,type:'register'},
         ],
         //定义表单数据
         ruleForm:{
              email: '',
              password: '',
              passwords:'',
              repass:''
         },
         //定义表单校验规则
          rules2:{
                  email: [
                      { validator: checkEmail, trigger: 'blur' }  //校验邮箱
                  ],
                  password: [
                      { validator: checkPassword, trigger: 'blur' } //密码
                  ],
                  passwords: [
                      { validator: checkPasswords, trigger: 'blur' } //重复密码
                  ],
                  repass: [
                      { validator: checkRepass, trigger: 'blur' } //验证码
                  ]
          },
          //定义登录注册按钮切换
          modal: 'login',
          // 定义按钮是否禁用状态
          BtnStatus:true,
          //定义获取验证码按钮
          codeBtnStatus:{
            status:false,
            text:'获取验证码'
          },
          timer:null,

      }
  },
  methods:{
   /*
   * 定义函数切换
   */
     toggleMenu(data){
        this.menuTab.forEach( (ele) => {
               ele.current = false
            })
            data.current = true
            this.modal = data.type
            this.$refs.FormName.resetFields();//清除表单数据
            clearInterval(this.timer);
            this.BtnStatus = true
            this.updateBtnStatus({
                  status:false,
                  text:'获取验证码'
                })
    },

    //获取验证码函数
    getSms(){
         if(this.ruleForm.email == ''){
              this.$message.error('邮箱不能为空！！')
              return false
            }else if( checkRegEmial(this.ruleForm.email)){
              this.$message.error('邮箱格式不正确！！')
              return false
            }else{
              let data = {
                username:this.ruleForm.email,
                module:this.modal
              }
              this.codeBtnStatus.status = true
              this.codeBtnStatus.text = '发送中...'

                GetSms(data).then((response)=>{
                     this.$message.success(response.data.message)
                     this.BtnStatus  = false  //修改按钮状态是否可用
                     this.countDown(60)
                   }).catch((error)=>{
                    console.log(error)
                 })
            }
    },

    //表单提交函数
    submitForm(FormName){
        this.$refs[FormName].validate((valid) => {
            if (valid) {
               this.modal == 'login' ? this.login() : this.register()
            } else {
                return false;
            }
        })
    },
     //定义倒计时函数
    countDown(number){
        if(this.timer ){clearInterval(this.timer)}
          let time = number
          this.timer = setInterval(()=>{
            time -- ;
            if(time === 0){
                clearInterval(this.timer)
                this.updateBtnStatus({
                  status:false,
                  text:'重新获取'
                })
            }else{
              this.codeBtnStatus.text = `倒计时${time}秒`
            }
          },1000)
    },

    //登录函数
    login(){
       let data = {
                  username:this.ruleForm.email,
                  password:this.ruleForm.password,
                  code:this.ruleForm.repass,
                }
                 Login(data).then((res)=>{
                    console.log(res)
                    let userInfo = res.data.data
                    
                    this.$store.commit('app/SET_TOKEN',userInfo.token)  //存储用户token
                    this.$store.commit('app/SET_USERNAME',userInfo.username)  //存储用户名
                    setCookie(userInfo.token)
                    setUsername(userInfo.username)
                    this.$message.success(res.data.message)
                    this.$router.push('/console')
                 }).catch((error)=>{
                    console.log(error)
                 })
    },
    //注册函数
    register(){
       let data = {
                  username:this.ruleForm.email,
                  password:this.ruleForm.password,
                  code:this.ruleForm.repass,
                  module:"register"
                }
                 SignIn(data).then((res)=>{
                    this.$message.success(res.data.message)
                    this.toggleMenu(menuTab[0])
                 }).catch((error)=>{
                    console.log(error)
                 })
    },
    //更改按钮状态函数
    updateBtnStatus(params){
       this.codeBtnStatus.status = params.status;
       this.codeBtnStatus.text = params.text;
    }
  },  
}
</script>

<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba(0, 0, 0, .1);
  }
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
  .item-from { margin-bottom: 13px; }
  .block {
    display: block;
    width: 100%;
  }
  .login-btn { margin-top: 19px; }
}
</style>
