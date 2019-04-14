<template>
<el-tabs v-model="activeName" type="card" @tab-click="handleClick">

  <el-tab-pane label="用户管理" name="first">

    <el-select v-model="value8" filterable placeholder="请选择" @change="onChange">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
      </el-option>
    </el-select>
    <el-button type="success" plain icon="el-icon-search" v-on:click="draw">查詢</el-button>
    {{selected}}

    <el-row>
      <el-col :span="12">
        <div class="grid-content bg-purple">
          <el-tree :data="data" show-checkbox :props="defaultProps" @check="onCheck1" @node-click="handleNodeClick"></el-tree>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content bg-purple-light">
          <div class="grid-content bg-purple">
            <el-tree :data="data" show-checkbox :props="defaultProps" @check="onCheck2" @node-click="handleNodeClick"></el-tree>
          </div>
        </div>
      </el-col>
    </el-row>


    <!-- <el-tree :data="data" show-checkbox :props="defaultProps" @check="onCheck" @node-click="handleNodeClick" node-key="label" :default-checked-keys="['開盤價', '最高價', '最低價', '收盤價']"></el-tree> -->
    {{checked1}}{{checked2}}

  </el-tab-pane>

  <el-tab-pane label="配置管理" name="second">
    <el-checkbox v-model="isSync" @change="syn">Sync</el-checkbox>
    <el-checkbox v-model="isnmz" @change="normalize">normalize</el-checkbox>
    {{sync}}
    <div id="graph1" style="width:100%;height:500px;"></div>
    <div id="graph2" style="width:100%;height:500px;"></div>

  </el-tab-pane>
  <el-tab-pane label="角色管理" name="third">
    <el-transfer v-model="value" :data="columns"></el-transfer>
  </el-tab-pane>
  <el-tab-pane label="定时任务补偿" name="fourth">
    <el-checkbox v-model="issync" @change="update">Sync</el-checkbox>
    <!-- <input type="checkbox" id="chk-sync" onchange="update()"><label for="chk-sync">Sync</label> -->

    <div id="g1a"></div>
    <div id="g2a"></div>
    <div id="g3a"></div>

    <div id="g1b"></div>
    <div id="g2b"></div>
    <div id="g3b"></div>
  </el-tab-pane>
</el-tabs>
</template>

<!-- <script src="http://dygraphs.com/extras/synchronizer.js"></script> -->
<!-- <script type="text/javascript" src="@/funcs/synchronizer.js"></script> -->

<script >
import {
  ids,
  cols,
  mysum
} from '@/requests/request';

import {
  mean,
  stdev,
  normalize
} from '@/funcs/math';

import {
  transpose
} from '@/funcs/array';

import Dygraph from 'dygraphs';

(function() {
  /* global Dygraph:false */
  'use strict';

  var synchronize = function( /* dygraphs..., opts */ ) {
    if (arguments.length === 0) {
      throw 'Invalid invocation of Dygraph.synchronize(). Need >= 1 argument.';
    }

    var OPTIONS = ['selection', 'zoom', 'range'];
    var opts = {
      selection: true,
      zoom: true,
      range: true
    };
    var dygraphs = [];
    var prevCallbacks = [];

    var parseOpts = function(obj) {
      if (!(obj instanceof Object)) {
        throw 'Last argument must be either Dygraph or Object.';
      } else {
        for (var i = 0; i < OPTIONS.length; i++) {
          var optName = OPTIONS[i];
          if (obj.hasOwnProperty(optName)) opts[optName] = obj[optName];
        }
      }
    };

    if (arguments[0] instanceof Dygraph) {
      // Arguments are Dygraph objects.
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] instanceof Dygraph) {
          dygraphs.push(arguments[i]);
        } else {
          break;
        }
      }
      if (i < arguments.length - 1) {
        throw 'Invalid invocation of Dygraph.synchronize(). ' +
          'All but the last argument must be Dygraph objects.';
      } else if (i == arguments.length - 1) {
        parseOpts(arguments[arguments.length - 1]);
      }
    } else if (arguments[0].length) {
      // Invoked w/ list of dygraphs, options
      for (var i = 0; i < arguments[0].length; i++) {
        dygraphs.push(arguments[0][i]);
      }
      if (arguments.length == 2) {
        parseOpts(arguments[1]);
      } else if (arguments.length > 2) {
        throw 'Invalid invocation of Dygraph.synchronize(). ' +
          'Expected two arguments: array and optional options argument.';
      } // otherwise arguments.length == 1, which is fine.
    } else {
      throw 'Invalid invocation of Dygraph.synchronize(). ' +
        'First parameter must be either Dygraph or list of Dygraphs.';
    }

    if (dygraphs.length < 2) {
      throw 'Invalid invocation of Dygraph.synchronize(). ' +
        'Need two or more dygraphs to synchronize.';
    }

    var readycount = dygraphs.length;
    for (var i = 0; i < dygraphs.length; i++) {
      var g = dygraphs[i];
      g.ready(function() {
        if (--readycount == 0) {
          // store original callbacks
          var callBackTypes = ['drawCallback', 'highlightCallback', 'unhighlightCallback'];
          for (var j = 0; j < dygraphs.length; j++) {
            if (!prevCallbacks[j]) {
              prevCallbacks[j] = {};
            }
            for (var k = callBackTypes.length - 1; k >= 0; k--) {
              prevCallbacks[j][callBackTypes[k]] = dygraphs[j].getFunctionOption(callBackTypes[k]);
            }
          }

          // Listen for draw, highlight, unhighlight callbacks.
          if (opts.zoom) {
            attachZoomHandlers(dygraphs, opts, prevCallbacks);
          }

          if (opts.selection) {
            attachSelectionHandlers(dygraphs, prevCallbacks);
          }
        }
      });
    }

    return {
      detach: function() {
        for (var i = 0; i < dygraphs.length; i++) {
          var g = dygraphs[i];
          if (opts.zoom) {
            g.updateOptions({
              drawCallback: prevCallbacks[i].drawCallback
            });
          }
          if (opts.selection) {
            g.updateOptions({
              highlightCallback: prevCallbacks[i].highlightCallback,
              unhighlightCallback: prevCallbacks[i].unhighlightCallback
            });
          }
        }
        // release references & make subsequent calls throw.
        dygraphs = null;
        opts = null;
        prevCallbacks = null;
      }
    };
  };

  function arraysAreEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    var i = a.length;
    if (i !== b.length) return false;
    while (i--) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function attachZoomHandlers(gs, syncOpts, prevCallbacks) {
    var block = false;
    for (var i = 0; i < gs.length; i++) {
      var g = gs[i];
      g.updateOptions({
        drawCallback: function(me, initial) {
          if (block || initial) return;
          block = true;
          var opts = {
            dateWindow: me.xAxisRange()
          };
          if (syncOpts.range) opts.valueRange = me.yAxisRange();

          for (var j = 0; j < gs.length; j++) {
            if (gs[j] == me) {
              if (prevCallbacks[j] && prevCallbacks[j].drawCallback) {
                prevCallbacks[j].drawCallback.apply(this, arguments);
              }
              continue;
            }

            // Only redraw if there are new options
            if (arraysAreEqual(opts.dateWindow, gs[j].getOption('dateWindow')) &&
              arraysAreEqual(opts.valueRange, gs[j].getOption('valueRange'))) {
              continue;
            }

            gs[j].updateOptions(opts);
          }
          block = false;
        }
      }, true /* no need to redraw */ );
    }
  }

  function attachSelectionHandlers(gs, prevCallbacks) {
    var block = false;
    for (var i = 0; i < gs.length; i++) {
      var g = gs[i];

      g.updateOptions({
        highlightCallback: function(event, x, points, row, seriesName) {
          if (block) return;
          block = true;
          var me = this;
          for (var i = 0; i < gs.length; i++) {
            if (me == gs[i]) {
              if (prevCallbacks[i] && prevCallbacks[i].highlightCallback) {
                prevCallbacks[i].highlightCallback.apply(this, arguments);
              }
              continue;
            }
            var idx = gs[i].getRowForX(x);
            if (idx !== null) {
              gs[i].setSelection(idx, seriesName);
            }
          }
          block = false;
        },
        unhighlightCallback: function(event) {
          if (block) return;
          block = true;
          var me = this;
          for (var i = 0; i < gs.length; i++) {
            if (me == gs[i]) {
              if (prevCallbacks[i] && prevCallbacks[i].unhighlightCallback) {
                prevCallbacks[i].unhighlightCallback.apply(this, arguments);
              }
              continue;
            }
            gs[i].clearSelection();
          }
          block = false;
        }
      }, true /* no need to redraw */ );
    }
  }

  Dygraph.synchronize = synchronize;

})();

export default {
  mounted() {
    this.get_ids(),
      this.get_cols()
  },

  data() {
    return {
      activeName: 'first',
      columns: [],
      value8: '',
      value: [],
      data: [{
        label: '一级 1',
        children: [{
          label: '二级 1-1',
        }, {
          label: '二级 1-2',
        }, ]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      selected: '',
      dygraphs: {
        g1: {
          div: '',
          data: {
            raw: [],
            nmz: []
          },
          options: {},
          g: {},
        },
        g2: {
          div: '',
          data: {
            raw: [],
            nmz: []
          },
          options: {},
          g: {},
        }
      },
      checked1: [],
      checked2: [],
      isnmz: false,
      issync: false,
      isSync: true,
      gs: [],
      sync: [],
    }
  },
  computed: {

  },

  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleNodeClick(data) {
      console.log(data);
    },
    get_ids() {
      ids().then((res) => {
        const li = res['ids'].map(x => ({
          value: x,
          label: x
        }))
        this.options = li
      }).catch((error) => {
        console.log(error)
        this.options = [{
          value: '',
          label: ''
        }];
      });
    },
    get_cols() {
      cols().then((res) => {
        this.columns = res['cols'].map(x => ({
          key: x,
          label: x
        }));
        this.tree()
      }).catch((error) => {
        console.log(error)
        this.columns = [error];
      });

    },
    tree() {
      cols().then((res) => {
        let children = res['cols'].map(x => ({
          label: x
        }));
        this.data = [{
          label: '全部',
          children: children
        }]
      }).catch((error) => {
        console.log(error)
        this.data = [error];
      });
    },
    onChange(x) {
      console.log(x)
      this.selected = x
    },
    onCheck1(x, y) {
      console.log(x, y)
      this.checked1 = y.checkedNodes.filter(x => !x.hasOwnProperty("children")).map(x => x['label'])
    },
    onCheck2(x, y) {
      console.log(x, y)
      this.checked2 = y.checkedNodes.filter(x => !x.hasOwnProperty("children")).map(x => x['label'])
    },
    SetDygraph(g, div, data, options) {
      console.log("this.dygraphs[g]:", this.dygraphs[g]);
      this.dygraphs[g].div = div;
      this.dygraphs[g].data = data;
      this.dygraphs[g].options = options;
    },
    NewDygraph(g, div, data, options) {
      this.dygraphs[g].g = new Dygraph(div, data, options);
    },
    draw() {
      // swiching tab must be fast enough before dygraph draw, otherwise graph won't show
      this.activeName = 'second'
      const post1 = {
        id: this.selected.split(" ")[0],
        cols: this.checked1
      }
      mysum(post1).then((res) => {

        console.log(res)

        let data = res['data']
        for (let row of data) {
          row[0] = new Date(row[0])
        }
        console.log(data)

        let options1 = {
          labels: res['labels'],
          showRangeSelector: false,
          interactionModel: Dygraph.defaultInteractionModel,
          legend: 'follow',
          labelsSeparateLines: true
        }

        this.SetDygraph('g1', 'graph1', {
          raw: data,
          nmz: []
        }, options1);
        if (this.isnmz) {
          this.nmz();
        } else {
          this.NewDygraph('g1', 'graph1', data, options1);
        }

      }).catch((error) => {
        console.log(error)
      });

      const post2 = {
        id: this.selected.split(" ")[0],
        cols: this.checked2
      }
      mysum(post2).then((res) => {

        console.log(res)

        let data = res['data']
        for (let row of data) {
          row[0] = new Date(row[0])
        }
        console.log(data)


        let options2 = {
          labels: res['labels'],
          showRangeSelector: false,
          interactionModel: Dygraph.defaultInteractionModel,
          legend: 'follow',
          labelsSeparateLines: true
        }

        this.SetDygraph('g2', 'graph2', {
          raw: data,
          nmz: []
        }, options2);
        this.NewDygraph('g2', 'graph2', data, options2);
        this.gs = [this.dygraphs.g1.g, this.dygraphs.g2.g];
        this.syn();
      }).catch((error) => {
        console.log(error)
      });

    },
    syn() {
      // this.sync = Dygraph.synchronize(this.gs, {
      //   range: false
      // });
      console.log(this.isSync);
      if (this.isSync) {
        this.sync = Dygraph.synchronize(this.gs, {
          range: false
        });
      } else {
        this.sync.detach();
        // for (let i = 0; i < this.gs.length; ++i) {
        // this.gs[i].updateOptions({
        //           dateWindow: null,
        //     valueRange: null
        //   });
        //   }
      }
    },
    normalize(v) {
      console.log(v)
      if (v) {
        this.nmz()
      } else {
        this.raw()
      }
      this.gs = [this.dygraphs.g1.g, this.dygraphs.g2.g];
      this.syn();
    },
    nmz() {
      if (this.dygraphs.g1.data.nmz.length == 0) {

        let t = transpose(this.dygraphs.g1.data.raw);
        t = [t[0], ...t.slice(1).map(x => normalize(x))]
        let data = transpose(t);
        this.dygraphs.g1.g = new Dygraph(this.dygraphs.g1.div, data, this.dygraphs.g1.options);
        this.dygraphs.g1.data.nmz = data;
      } else {
        this.dygraphs.g1.g = new Dygraph(this.dygraphs.g1.div, this.dygraphs.g1.data.nmz, this.dygraphs.g1.options);
      }

    },
    raw() {
      this.dygraphs.g1.g = new Dygraph(this.dygraphs.g1.div, this.dygraphs.g1.data.raw, this.dygraphs.g1.options);
    },
    update() {
      console.log(Dygraph.synchronize);
      var sync;
      var gs;
      let options = {
        interactionModel: Dygraph.defaultInteractionModel,
        legend: 'follow',
        labelsSeparateLines: true
      }

      gs = [
        new Dygraph(document.getElementById("g1a"), data(0.1, 1), options),
        new Dygraph(document.getElementById("g2a"), data(0.2, 2)),
        new Dygraph(document.getElementById("g3a"), data(0.3, -2))
      ];
      console.log(this.issync)
      // window.update = function() {
      // var chk = document.getElementById('chk-sync').checked;
      if (this.issync) {
        sync = Dygraph.synchronize(gs);
      } else {
        sync.detach();
        for (i = 0; i < 3; ++i) {
          gs[i].updateOptions({
            dateWindow: null,
            valueRange: null
          });
        }
      }
      // }

      function data(mul, shift) {
        var arr = [];

        for (var i = 1; i <= 31; i++) {
          arr.push([new Date('2015/01/' + i), Math.sin(i * mul) + shift]);
        }

        return arr;
      }

    }
  }
};
</script>
