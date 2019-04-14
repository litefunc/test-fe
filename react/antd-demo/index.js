import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { DatePicker } from 'antd';

// import { Tabs } from 'antd';
// const TabPane = Tabs.TabPane;
//
// function callback(key) {
//   console.log(key);
// }
//
// function Tab(){
//   return (
//     <Tabs defaultActiveKey="1" onChange={callback}>
//       <TabPane tab="Tab 1" key="1">Content of Tab Pane 1</TabPane>
//       <TabPane tab="Tab 2" key="2">Content of Tab Pane 2</TabPane>
//       <TabPane tab="Tab 3" key="3">Content of Tab Pane 3</TabPane>
//     </Tabs>
//   );
// }

import Tabs from './components/tabs';

// ReactDOM.render(
//   <Tabs defaultActiveKey="1" onChange={callback}>
//     <TabPane tab="Tab 1" key="1">Content of Tab Pane 1</TabPane>
//     <TabPane tab="Tab 2" key="2">Content of Tab Pane 2</TabPane>
//     <TabPane tab="Tab 3" key="3">Content of Tab Pane 3</TabPane>
//   </Tabs>
// , document.getElementById('root'));

function App() {
  return (
    <div style={{ margin: 100 }}>
      <Tabs />
    </div>
  );
}


// function App() {
//   return (
//     <div style={{ margin: 100 }}>
//       <h1>AntDesign Demo</h1>
//       <hr /><br />
//       <DatePicker />
//     </div>
//   );
// }
//
ReactDOM.render(<App />, document.getElementById('root'));
