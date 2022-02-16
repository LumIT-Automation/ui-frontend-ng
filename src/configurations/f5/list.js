import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';



class List extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: ''
    };
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


  setNetwork = e => {
    console.log(e.target.value)
  }

  render() {
    console.log(this.props.configuration)
    const columns = [
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.network ?
              <Input id='network' defaultValue={obj.network} onChange={e => this.setNetwork(e)} />
            :
              <Input id='network' defaultValue={obj.network} onChange={e => this.setNetwork(e)} />
            }
          </React.Fragment>
        ),

      },
      {
        title: 'Snat',
        align: 'center',
        dataIndex: 'snat',
        key: 'snat',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.snat ?
              <Input id='snat' defaultValue={obj.network} onChange={e => this.setNetwork(e)} />
            :
              <Input id='snat' defaultValue={obj.network} onChange={e => this.setNetwork(e)} />
            }
          </React.Fragment>
        ),
      },
    ];

    let randomKey = () => {
      return Math.random().toString()
    }

    return (
      <Table
        columns={columns}
        dataSource={this.props.configuration}
        bordered
        rowKey={randomKey}
        scroll={{x: 'auto'}}
        pagination={{ pageSize: 10 }}
        style={{marginBottom: 10}}
      />
    )
  }
}

export default connect((state) => ({
  configuration: state.f5.configuration,
}))(List);
