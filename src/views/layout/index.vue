<template>
  <el-container>
    <el-aside width="200px"><AppAside></AppAside></el-aside>
    <el-container>
      <el-header><AppHeader></AppHeader></el-header>
      <el-main>
        <!-- 子路由的出口 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AppAside from './components/AppAside'
import AppHeader from './components/AppHeader'
export default {
  data () {
    return {

    }
  },
  components: {
    AppAside,
    AppHeader
  }
}
</script>

<style>
.el-container {
  height: 100%;
}
.el-header{
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}
.el-aside {
  background-color: #D3DCE6;
  color: #333;
  line-height: 200px;
}
.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 160px;
}
body > .el-container {
  margin-bottom: 40px;
}
</style>
