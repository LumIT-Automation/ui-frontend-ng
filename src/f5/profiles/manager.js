import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setProfileTypes, setProfilesLoading, setProfiles, setProfilesFetch } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd'
import Highlighter from 'react-highlight-words'




/*

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
    if (this.props.asset && this.props.partition) {
      if (!this.props.profiles) {
        this.fetchProfiles()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.partition) {
      if (!this.props.profiles) {
        this.fetchProfiles()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchProfiles()
      }
      if (this.props.profilesFetch) {
        this.fetchProfiles()
        this.props.dispatch(setProfilesFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchProfiles = async () => {
    this.props.dispatch(setProfilesLoading(true))

    let profileTypes = await this.fetchProfilesTypeList()
    this.props.dispatch(setProfileTypes(profileTypes.data.items))

    let profiles = await this.fetchProfilesAny()
    let list = []

    for (let t in profiles.data) {
      let type = t
      let values = Object.values(profiles.data[t])

      values.forEach(o => {
        o.forEach(p => {
          Object.assign(p, {type: type});
          list.push(p)
        })
      })
    }

    this.props.dispatch(setProfilesLoading(false))
    this.props.dispatch(setProfiles(list))
  }

  fetchProfilesTypeList = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/`, this.props.token)
    return r
  }

  fetchProfilesAny = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/ANY/`, this.props.token)
    return r
  }

/*
  profilesLoop = async types => {

    const promises = types.map(async type => {
      const resp = await this.fetchProfilesByType(type)
      resp.data.items.forEach(item => {
        Object.assign(item, {type: type});
      })
      return resp
    })

    const response = await Promise.all(promises)

    let list = []
    response.forEach(r => {
      r.data.items.forEach(m => {
       list.push(m)
      })
    })

    return list
  }

  fetchProfilesByType = async (type) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
      this.props.dispatch(setError(error))
      this.setState({loading: false, success: false})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/${type}/`, this.props.token)
    return r
  }

*/
  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
           this.props.authorizations && (this.props.authorizations.profiles_post || this.props.authorizations.any) ?
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


        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  profiles: state.f5.profiles,
  profilesFetch: state.f5.profilesFetch
}))(Manager);
