import {MessageBox} from 'element-ui'

//封装自定义全局函数
export default {
    install (Vue ,option){
        Vue.prototype.confirm = (params)=>{
            MessageBox.confirm(params.content, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                center: true
              }).then(() => {
                params.fn &&  params.fn(params.id)
              }).catch(() => {
              });
        }
    }
}