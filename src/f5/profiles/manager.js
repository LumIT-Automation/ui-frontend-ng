import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import { profilesLoading, profiles, profilesFetch, profilesError,  } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Alert } from 'antd'



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
      if (!this.props.profilesError) {
        this.props.dispatch(profilesFetch(false))
        if (!this.props.profiles) {
          this.fetchProfiles()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
      if (!this.props.profiles) {
        this.fetchProfiles()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchProfiles()
      }
    }
    if (this.props.asset && this.props.partition) {
      if (this.props.profilesFetch) {
        this.fetchProfiles()
        this.props.dispatch(profilesFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchProfiles = async () => {
    this.props.dispatch(profilesLoading(true))

    let profs = await this.fetchProfilesAny()

    if (profs.status && profs.status !== 200 ) {
      this.props.dispatch(profilesError(profs))
      this.props.dispatch(profilesLoading(false))
    }
    else {
      let list = []

      for (let t in profs.data) {
        let type = t
        let values = Object.values(profs.data[t])

        values.forEach(o => {
          o.forEach(p => {
            Object.assign(p, {type: type});
            list.push(p)
          })
        })
      }

      this.props.dispatch(profilesLoading(false))
      this.props.dispatch(profiles(list))
    }

  }

  fetchProfilesAny = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/ANY/`, this.props.token)
    return r
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

        <React.Fragment>
          { this.props.profilesError ? <Error component={'profiles manager'} error={[this.props.profilesError]} visible={true} type={'profilesError'} /> : null }
        </React.Fragment>

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
  profilesFetch: state.f5.profilesFetch,
  profilesError: state.f5.profilesError,
}))(Manager);
