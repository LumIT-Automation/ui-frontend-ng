import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'
import { setProfilesTypeList, setProfilesList, setProfilesFetchStatus } from '../../_store/store.f5'


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
      profileFullList: []
    };
  }

  componentDidMount() {
    if (this.props.authorizations && (this.props.authorizations.profiles_get || this.props.authorizations.any ) && this.props.partition ) {
      this.fetchProfilesTypeList()
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( ((prevProps.asset !== this.props.asset) && this.props.partition) || (this.props.asset && (prevProps.partition !== this.props.partition)) ) {
      this.fetchProfilesTypeList()
    }
    if (this.props.profilesFetchStatus === 'updated') {
      this.fetchProfilesTypeList()
      this.props.dispatch(setProfilesFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }

  storeSetter = resp => {
    return new Promise( (resolve, reject) => {
      try {
        this.props.dispatch(setProfilesTypeList( resp ))
        if ( this.props.profilesTypeList  ) {
          resolve(this.props.profilesTypeList)
        }
      }
      catch(e) {
        reject(e)
      }
    })
  }

  fetchProfilesTypeList = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {

        console.log(resp)
        this.setState({loading: false})
        this.storeSetter(resp).then(this.fetchProfiles())
      },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/`, this.props.token)
  }

  fetchProfiles =  () => {
    let blank = []
    this.props.dispatch(setProfilesList(blank))
    this.setState({profileFullList: []})
    this.props.profilesTypeList.forEach(type => {
      this.fetchProfilesType(type)
    })
  }

  fetchProfilesType = async (type) => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.addToList(resp, type))
      },
      error => {
        console.log(error)
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/${type}/`, this.props.token)
  }

  addToList = (resp, type) => {
    let mon = Object.assign([], resp.data.items);
    let newList = []
    let currentList = Object.assign([], this.state.profileFullList);
    let l = []

    mon.forEach(m => {
      Object.assign(m, {type: type});
      l.push(m)
    })

    newList = currentList.concat(l);
    this.setState({profileFullList: newList}, () => this.props.dispatch(setProfilesList(newList)))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
           this.props.authorizations && (this.props.authorizations.profiles_post || this.props.authorizations.any) ?
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
  profilesTypeList: state.f5.profilesTypeList,
  profiles: state.f5.profiles,
  profilesFetchStatus: state.f5.profilesFetchStatus
}))(Manager);
