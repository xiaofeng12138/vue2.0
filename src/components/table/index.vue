<template>
  <div>
    <el-table :data="data.tableData" border style="width: 100%" @selection-change="chooseDel">
      <el-table-column v-if="data.tableConfig.selection" type="selection" width="55" align="center"></el-table-column>

      <!-- 带插槽的table-->
      <template v-for="(item,index) in data.tableConfig.tHead">
        <el-table-column
          v-if="item.columnType === 'slot'"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          align="center"
        >
          <template slot-scope="scope">
            <slot :name="item.slotName" :data="scope.row"></slot>
          </template>
        </el-table-column>
        <el-table-column
          v-else
          :key="index"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          align="center"
        ></el-table-column>
      </template>
    </el-table>
    <div style="padding:15px 0">
      <el-row>
        <el-col :span="4">
          <slot name="tableFooterLeft"></slot>
        </el-col>
        <el-col :span="20">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageData.pageNumber"
            :page-sizes="[10, 20, 30, 40]"
            :page-size="pageData.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageData.total"
          ></el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onBeforeMount, watch } from "@vue/composition-api";
import { Pagination } from "./page";
import { loadDataFn } from "./loaddata";
import { LoadTableData } from "@/api/common";
export default {
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    tableRow: {
      type: Object,
      default: () => {}
    }
  },
  setup(props, { root, emit }) {
    const { getTableInfo, tableData } = loadDataFn();
    const {
      pageData,
      handleSizeChange,
      handleCurrentChange,
      chageTotal
    } = Pagination();
    const data = reactive({
      tableConfig: {
        selection: true,
        tHead: [],
        requestDataList: {}
      },
      tableData: [],
      total: 0
    });

    const initTableConfig = () => {
      //处理传过来的config项
      let configData = props.config;
      let keys = Object.keys(data.tableConfig);
      for (let key in configData) {
        if (keys.includes(key)) {
          //es6的方法
          data.tableConfig[key] = configData[key];
        }
        // if (data.tableConfig[key]) {
        //   data.tableConfig[key] = configData[key];
        // }
      }
    };

    //监听请求数据函数里面的变化
    //监听一条数据的变化写法
    // watch(
    //   () => tableData.item,
    //   (dataValue, totalValue) => (data.tableData = dataValue)
    // );

    //监听数据的变化
    watch(
      [() => tableData.item, () => tableData.total],
      ([dataValue, totalValue]) => {
        data.tableData = dataValue;
        chageTotal(totalValue);
      }
    );

    //监听页码的变化
    watch(
      [() => pageData.pageNumber, () => pageData.pageSize],
      ([pageNumber, pageSize]) => {
        let requestInfo = data.tableConfig.requestDataList;
        if (requestInfo.data) {
          requestInfo.data.pageNumber = pageNumber;
          requestInfo.data.pageSize = pageSize;
          getTableInfo(data.tableConfig.requestDataList);
        }
      }
    );
    //表格某一行选中函数
    const chooseDel = row => {
      // console.log(row.map(item => item.id));
      // console.log(props.tableRow);
      let rowData = {
        rowId: row.map(item => item.id)
      };
      emit("update:tableRow", rowData);
    };

    onBeforeMount(() => {
      initTableConfig();
      getTableInfo(data.tableConfig.requestDataList);
    });

    const callbackUserTable = () => {
      getTableInfo(data.tableConfig.requestDataList);
    };

    //带参数的刷新数据
    const paramsLoadData = params => {
      let requsetData = Object.assign({}, params, {
        pageNumber: 1,
        pageSize: 10
      });
      data.tableConfig.requestDataList.data = requsetData;
      getTableInfo(data.tableConfig.requestDataList);
    };

    return {
      data,
      initTableConfig,
      pageData,
      handleSizeChange,
      handleCurrentChange,
      chageTotal,
      chooseDel,
      callbackUserTable,
      paramsLoadData
    };
  }
};
</script>
<style lang="scss" scope="this api replaced by slot-scope in 2.5.0+">
.el-pagination {
  text-align: right;
  margin-top: 10px;
}
</style>