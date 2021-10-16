import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setError } from '../../_store/store.error'
//import { setNodesList } from '../../_store/store.f5'


import List from './list'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



/*

*/


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( ((prevProps.asset !== this.props.asset) && this.props.partition) || (this.props.asset && (prevProps.partition !== this.props.partition)) ) {
        //this.fetchNodes()
    }
    /*if (this.props.authorizations !== prevProps.authorizations) {
      this.fetchAssets()
    }*/
  }

  componentWillUnmount() {
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

      { (this.props.asset && this.props.asset.id ) ?
          this.props.containersLoading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <List/>
        :
        <Alert message="Asset not set" type="error" />
      }

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,

  asset: state.infoblox.asset,

  containersLoading: state.infoblox.containersLoading,
  containers: state.infoblox.containers

}))(Manager);
