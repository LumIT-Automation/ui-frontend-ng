import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setPoolsLoading, setPools, setPoolsFetch } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';
import Highlighter from 'react-highlight-words';



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
    if (this.props.asset && this.props.partition) {
      if (!this.props.pools) {
        this.fetchPools()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.partition) {
      if (!this.props.pools) {
        this.fetchPools()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchPools()
      }
      if (this.props.poolsFetch) {
        this.fetchPools()
        this.props.dispatch(setPoolsFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }


  fetchPools = async () => {
    this.props.dispatch(setPoolsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setPools(resp))
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token)
    this.props.dispatch(setPoolsLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
         this.props.authorizations && (this.props.authorizations.pools_post || this.props.authorizations.any) ?
            <Add/>
          :
          null
        :
        null
      }

      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
        <List/>
        :
        <Alert message="Asset and Partition not set" type="error" />
      }

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  pools: state.f5.pools,
  poolsFetch: state.f5.poolsFetch
}))(Manager);
