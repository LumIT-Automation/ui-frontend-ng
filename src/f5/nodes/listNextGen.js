import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import TableConcerto from './tableConcerto'

//import Modify from './modify'
//import Delete from './delete'

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';





class List extends TableConcerto {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Table
          columns={this.columns('f5 nodes')}
          dataSource={this.props.nodes}
          bordered
          rowKey="name"
          scroll={{x: 'auto'}}
          pagination={{ pageSize: 10 }}
          style={{marginBottom: 10}}
        />
      </Space>

    )
  }
}


export default connect((state) => ({
  authorizations: state.authorizations.f5,
  nodes: state.f5.nodes,
}))(List);
