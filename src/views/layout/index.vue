<template>
    <div :class="[isCollapse ?'close': 'open']">
        <Header/>
        <Main/>
        <Nav/>
    </div>
</template>

<script>
import Header from './components/header'
import Main from './components/main'
import Nav from './components/nav'
import { mapState} from 'vuex'
export default {
    components:{
       Header, Main,Nav
    },
    data(){
        return{

        }
    },
    computed:{
        ...mapState('app' ,['isCollapse'])


        //方法一：
        // isCollapse(){
        //    return this.$store.state.app.isCollapse 
        // }
    },
    
}
</script>

<style lang="scss" scoped>

</style>


