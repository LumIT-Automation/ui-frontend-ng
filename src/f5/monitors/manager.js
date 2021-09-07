import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'
import { setMonitorsList } from '../../_store/store.f5'


import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null,
      monitorFullList: []
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.monitors_get || this.props.authorizations.any ) && this.props.asset && this.props.partition ) {
      //this.fetchMonitors()
      this.fetchMonitors()
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( ((prevProps.asset !== this.props.asset) && this.props.partition) || (this.props.asset && (prevProps.partition !== this.props.partition)) ) {
      //this.fetchMonitors()
      this.fetchMonitors()
    }
    /*if (this.props.authorizations !== prevProps.authorizations) {
      this.fetchAssets()
    }*/
  }

  componentWillUnmount() {
  }


  fetchMonitors =  () => {
    let list = ['tcp', 'tcp-half-open', 'http']
    list.forEach(type => {
      this.fetchMonitorsType(type)
    }
  )
    //this.props.dispatch(setMonitorsList(this.state.body.monitorFullList))
  }

  fetchMonitorsType = async (type) => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.addToList(resp, type))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/${type}/`, this.props.token)
  }

  addToList = (resp, type) => {
    let mon = Object.assign([], resp.data.items);
    let newList = []
    let currentList = Object.assign([], this.state.monitorFullList);
    let l = []

    mon.forEach(m => {
      Object.assign(m, {type: type});
      l.push(m)
    })

    newList = currentList.concat(l);
    this.setState({monitorFullList: newList})
    this.props.dispatch(setMonitorsList(newList))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
//    console.log(this.state.body.monitorFullList)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
           this.props.authorizations && (this.props.authorizations.monitors_post || this.props.authorizations.any) ?
            <div>
              <br/>
              <Add/>
            </div>
            :
            null
          :
          null
        }

        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <List/>
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
  monitors: state.f5.monitors
}))(Manager);
