<template>
  <el-dialog
    title="新增"
    :visible.sync="dialogTableVisible"
    :modal-append-to-body="false"
    @opened="open"
    @close="close"
    width="700px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" ref="formName" :rules="rules2">
      <el-form-item label="用户名：" :label-width="formLabelWidth" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码：" :label-width="formLabelWidth" prop="password">
        <el-input type="password" v-model="form.password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item label="姓名：" :label-width="formLabelWidth" prop="truename">
        <el-input v-model="form.truename" placeholder="请输入真实姓名"></el-input>
      </el-form-item>
      <el-form-item label="手机号：" :label-width="formLabelWidth" prop="phone">
        <el-input type="number" v-model="form.phone" placeholder="请输入手机号码"></el-input>
      </el-form-item>
      <el-form-item label="地区：" :label-width="formLabelWidth">
        <cityPicker
          :cityPickerData.sync="cityPickerData"
          :cityChoose="['provice','city','area','street']"
        />
        <!-- {{data.cityPickerData}} -->
      </el-form-item>
      <el-form-item label="是否启用：" :label-width="formLabelWidth" prop="dd">
        <el-radio v-model="form.status" label="1" active-value="1">启用</el-radio>
        <el-radio v-model="form.status" label="2" active-value="1">禁用</el-radio>
      </el-form-item>
      <el-form-item label="角色：" :label-width="formLabelWidth" prop="role">
        <el-checkbox-group v-model="form.role">
          <el-checkbox
            v-for="(item,index) in queryRole"
            :key="index"
            :label="item.role"
          >{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="按钮权限：" :label-width="formLabelWidth" prop="showBtnValue">
        <template v-if="userBtn.length > 0">
          <div v-for="(item,index) in userBtn" :key="index">
            <h4>{{item.name}}</h4>
            <template v-if="item.perm && item.perm.length > 0">
              <el-checkbox-group v-model="form.showBtnValue">
                <el-checkbox
                  v-for="(btn,index) in item.perm"
                  :key="index"
                  :label="btn.value"
                >{{ btn.name }}</el-checkbox>
              </el-checkbox-group>
            </template>
          </div>
        </template>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogTableVisible = false">取消</el-button>
      <el-button type="danger" @click="submitUser('formName')">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  GetRole,
  addUser,
  userEdit,
  GetSystem,
  getUserBtn
} from "@/api/user.js";
import cityPicker from "@/components/cityPicker/index";
import { reactive, ref, onMounted, watch } from "@vue/composition-api";
import EventBus from "@/utils/eventBus"; //引入事件车 中央事件
import { stripscript, checkRegEmial, checkRegPass } from "@/utils/reg"; //引入正则校验

export default {
  components: { cityPicker },
  props: {
    flag: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: () => {}
    }
  },
  
  data(){
     // 校验用户名
    let checkEmail = (rule, value, callback) => {
      let ddvalue = this.form.username;
      if (!ddvalue) {
        return callback(new Error("用户名不能为空"));
      } else if (checkRegEmial(ddvalue)) {
        return callback(new Error("请输入合法的用户名"));
      } else {
        callback();
      }
    };
    // 校验密码
    let checkPassword = (rule, value, callback) => {
      //校验密码
      if (this.form.id && !value) {
        callback();
      }
      if ((this.form.id && value) || !this.form.id) {
        if (value) {
          this.form.password = stripscript(value);
          value = this.form.password;
        }
        if (value === "") {
          callback(new Error("请输入密码"));
        } else if (checkRegPass(value)) {
          return callback(new Error("密码为6-20位数字加字母组合"));
        } else {
          callback();
        }
      }
    };

    return{
      formLabelWidth:'90px',
      dialogTableVisible:false,
      userBtn: [], //用户按钮显示
      cityPickerData: {}, //城市选择返回的数据
      role: [],
      queryRole: [],
      form: {
        username: "",
        truename: "",
        password: "",
        phone: "",
        region: "",
        status: "1",
        role: [],
        showBtnValue: []
      },
      rules2:{
        username: [
          { validator: checkEmail, trigger: "blur" } //校验邮箱
        ],
        password: [
          { validator: checkPassword, trigger: "blur" } //密码
        ],
        role: [
          { required: true, message: "角色不能为空", trigger: "blur" } //角色
        ]
      },
    }
  },
  methods:{
     open(){
        GetRole().then(res => {
        this.queryRole = res.data.data;
      });
      getUserBtn().then(r => {
        this.userBtn = r.data.data;
      });
      let editData = this.editData;
      if (editData.id) {
        editData.role = editData.role ? editData.role.split(",") : [];
        editData.showBtnValue = editData.btnPerm
          ? editData.btnPerm.split(",")
          : [];
      } else {
        this.form.id && delete this.form.id;
      }
      for (let key in editData) {
        this.form[key] = editData.id ? editData[key] : "";
      }
     },
     close(){
        this.dialogTableVisible = false;
        this.$emit("update:flag", false); // 利用sync反向修改flag的值
        this.$emit("update:editData", {});
        this.resetFrom();
     },
      //重置表单
      resetFrom(formName){
          this.cityPickerData = {};
          this.$refs.formName.resetFields();
      },

       //用户提交
      submitUser(){
        this.$refs.formName.validate(valid => {
        if (valid) {
          let requsetData = Object.assign({}, this.form);
          requsetData.role = requsetData.role.join(); //数组转字符串
          requsetData.btnPerm = requsetData.showBtnValue.join(); //用户按钮数组转字符串
          requsetData.region = JSON.stringify(this.cityPickerData);

          if (requsetData.id) {
            if (requsetData.password) {
              requsetData.password = requsetData.password;
            } else {
              delete requsetData.password;
            }
            this.userEditFn(requsetData);
          } else {
            this.userAddFn(requsetData);
          }
        } else {
          return false;
        }
       })
      },
      //用户添加
      userAddFn(params){
        addUser(params).then(res => {
        if (res.data.resCode == 0) {
          this.$message.success("用户添加成功");
        }
        this.close();
        this.$emit("referParentFn");
       });
      },

      userEditFn(params){
         userEdit(params).then(res => {
          if (res.data.resCode == 0) {
            this.$message.success("用户修改成功");
          }
          this.close();
          this.$emit("referParentFn");
        });
      },
  },

  watch:{
     flag(newValue,oldValue){
         this.dialogTableVisible = newValue
     },
  }
};
</script>

<style lang="scss" scoped>
</style>


