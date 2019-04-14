<template>
  <div class="hello">
    <el-row>
  <el-button>默认按钮</el-button>
  <el-button type="primary" v-on:click="get_json">json</el-button>
  <el-button type="success" v-on:click="get_text">text</el-button>
  <el-button type="info" v-on:click="get_raw">raw</el-button>
  <el-button type="warning" v-on:click="get_ids">ids</el-button>
  <el-button type="danger">危险按钮</el-button>
</el-row>
      {{msg}}
      {{view}}
      {{list}}
  </div>
</template>

<script>

import {
  json,
  text,
  raw,
  ids
} from '@/requests/request';

export default {
  // mounted() {
  //   this.get();

  // },
  name: 'HelloWorld',
  data: () =>({
      msg: 'Welcome to 中文',
      view: "",
      list :[]
  }),
  methods: {
    get_json() {
      json().then((res) => {
        this.view = res;
      }).catch((error) => {
        this.view = error;
      });
    },
    get_text() {
      text().then((res) => {
        this.view = res;
      }).catch((error) => {
        this.view = error;
      });
    },
    get_raw() {
      raw().then((res) => {
        this.view = res;
      }).catch((error) => {
        this.view = error;
      });
    },
    get_ids() {
      ids().then((res) => {
        const li = res['ids'].map(x => ({
          value: x,
          label: x
        }))
        this.list = li
      }).catch((error) => {
        console.log(error)
        this.list = [{value: '', label: ''}];
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
