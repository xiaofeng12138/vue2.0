<template>
  <div class="user">
    <el-row>
      <el-col :span="20">
        <div class="labelWarp">
          <label>关键字</label>
          <div class="wrap-content">
            <el-row :gutter="16">
              <el-col :span="3">
                <selectVue :config="selectConfig" :selectData.sync="selectData" />
                <!-- <el-select v-model="data.selectValue">
                  <el-option
                    v-for="(item,index) in data.option"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>-->
              </el-col>
              <el-col :span="4">
                <el-input v-model="inputVlue"></el-input>
              </el-col>
              <el-col :span="16">
                <el-button type="danger" @click="search" v-if="showBtn('user:search')">搜索</el-button>
              </el-col>
              <!-- <el-col :span="4">
                <el-button type="danger" @click="fnn">触发</el-button>
              </el-col>-->
            </el-row>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <el-button
          type="danger"
          class="pull-right"
          @click="diaoValue = true"
          v-if="showBtn('user:add')"
        >添加用户</el-button>
      </el-col>
    </el-row>
    <div style="margin-top:30px">
      <tableVue :config="tableConfig" :tableRow.sync="tableRow" ref="tableFn">
        <template v-slot:status="slotData">
          <el-switch
            @change="changeStatus(slotData.data)"
            v-model="slotData.data.status"
            active-value="1"
            inactive-value="2"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
        <template v-slot:tableFooterLeft>
          <el-button
            size="small"
            type="danger"
            @click="removeAll"
            v-if="showBtn('user:batchDel')"
          >批量删除</el-button>
        </template>
        <template v-slot:operate="slotData">
          <el-button
            size="small"
            type="danger"
            @click="del(slotData.data)"
            v-if="showBtn('user:del')"
          >删除</el-button>
          <el-button
            size="small"
            type="success"
            @click="handerEdit(slotData.data)"
            v-if="showBtn('user:edit')"
          >编辑</el-button>
        </template>
      </tableVue>
    </div>
    <addUser
      :flag.sync="diaoValue"
      @close="fn"
      @referParentFn="referFn"
      :editData.sync="editData"
    />
    <!-- <A aaa="111" bbb="2222" v-on:xfFn="XFGG" /> -->
    <!-- <addUser :flag.sync="diaoValue" /> -->
  </div>
</template>

<script>
import tableVue from "@c/table/index.vue";
import selectVue from "@c/select/index.vue";
import addUser from "./dialog/add";
import { delUser, userActive, searchList } from "@/api/user";
import { global } from "@/utils/global.js"; //导入全局函数 删除提示函数
import EventBus from "@/utils/eventBus"; //引入事件车 中央事件
import A from "./dialog/test/a";
import { constants } from 'zlib';

export default {
  components: { selectVue, tableVue, addUser, A },
  data(){
    return{
      diaoValue:false,
      selectData: {}, //下拉框存值
      editData: {}, //编辑数据所储存的内容
      tableRow: {}, //删除选中的id
      selectConfig: {
        //下拉框组件传参的内容
        init: ["truename", "phone"]
      },
      handerUserSwitch: false,
      tableConfig: {
        //表格组件传参的内容
        selection: true, //表格前面是否有多选框
        requestDataList: {
          url: "getUserList",
          method: "post",
          data: {
            pageNumber: 1,
            pageSize: 10
          }
        },
        tHead: [
          {
            prop: "username",
            label: "用户名"
          },
          {
            prop: "truename",
            label: "真实姓名"
          },
          {
            prop: "phone",
            label: "手机号"
          },
          {
            prop: "region",
            label: "地区"
          },
          {
            prop: "role",
            label: "角色"
          },
          {
            label: "用户是否启用",
            columnType: "slot",
            slotName: "status"
          },
          {
            label: "操作",
            columnType: "slot",
            slotName: "operate"
          }
        ]
      },
      inputVlue: ""
    }
  },
  methods:{

    //删除函数
     del(params){
       this.tableRow.rowId = [params.id];
      this.confirm({
        content: "是否确认删除当前选中的用户！！",
        fn: this.confirmFn
      });
     },

     /*
     编辑
    */
   handerEdit(params){
      this.diaoValue = true;
      this.editData = Object.assign({}, params);
   },

   /**
    * 批量删除函数
   */
    removeAll(){
       if (!this.tableRow.rowId || this.tableRow.rowId.length == 0) {
        this.$message.error("请选择需要删除的用户！！！");
        return false;
      }
      this.confirm({
        content: "是否确认删除当前选中的用户！！",
        fn: this.confirmFn
      });
    },

    /**
     * 删除确认函数
    */
   confirmFn(){
     delUser({ id: this.tableRow.rowId }).then(res => {
        if (res.data.resCode == 0) {
          this.$message.success("删除成功");
          this.referFn();
        } else {
          this.$message.error("删除失败");
        }
      });
   },

   //用户是否启用函数
    changeStatus(params){
       if (this.handerUserSwitch) {
        return false;
      }
      this.handerUserSwitch = true;
      userActive({ id: params.id, status: params.status })
        .then(r => {
          if (r.data.resCode == 0) {
            this.$message.success(r.data.message);
            this.handerUserSwitch = !this.handerUserSwitch;
          } else {
            this.$message.error("修改失败");
          }
        })
        .catch(err => {
          this.handerUserSwitch = !this.handerUserSwitch;
        });
    },
    //刷新数据请求函数
    referFn(){
       this.$refs.tableFn.callbackUserTable(); //回调子组件的方法
    },

    //搜索函数
    search(){
      console.log(this.selectData);
        let requestData = {
        [this.selectData.value]: this.inputVlue
      };
      console.log(requestData)
      this.$refs.tableFn.paramsLoadData(requestData);
    },
    fn(){

    }
  },
  
};
</script>

<style lang="scss" scoped>
@import "../../styles/config.scss";
.user {
  .labelWarp {
    @include labelWarp(left, 60, 40);
  }
}
</style>


