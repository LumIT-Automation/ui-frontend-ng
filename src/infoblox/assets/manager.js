import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  assetsLoading,
  assets,
  assetsFetch,
  assetsError
} from '../store'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.assetsError) {
      this.props.dispatch(assetsFetch(false))
      if (!this.props.assets) {
        this.main()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assetsFetch) {
      this.main()
      this.props.dispatch(assetsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  main = async () => {
    this.props.dispatch(assetsLoading(true))
    let list = []
    let fetchedAssets = await this.assetsGet()
    if (fetchedAssets.status && fetchedAssets.status !== 200 ) {
      this.props.dispatch(assetsError(fetchedAssets))
      this.props.dispatch(assetsLoading(false))
      return
    }
    else {
      try {
        fetchedAssets.data.items.forEach((item, i) => {
          item.baseurl = item.baseurl.replaceAll('https://','')
          item.baseurl = item.baseurl.replaceAll('http://','')
          item.baseurl = item.baseurl.replaceAll(`${item.address}`,'')
          item.baseurl = item.baseurl.replaceAll(`${item.fqdn}`,'')
          item.baseurl = item.baseurl.replaceAll(/[\/]{1,}/g,'/');
          list.push(item)
        });
        this.props.dispatch(assets( {data: {items: list}} ))
      }catch(e) {
        console.log(e)
      }

    }
    this.props.dispatch(assetsLoading(false))
  }

  assetsGet = async () => {
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
    await rest.doXHR("infoblox/assets/", this.props.token)
    return r
  }


  render() {
    return (
      <React.Fragment>
        <br/>
        { this.props.authorizations && (this.props.authorizations.assets_post || this.props.authorizations.any) ?
          <React.Fragment>
            <Add vendor='infoblox'/>
            <br/>
            <br/>
          </React.Fragment>
        :
          null
        }

        <List/>

        { this.props.assetsError ? <Error component={'asset manager infoblox'} error={[this.props.assetsError]} visible={true} type={'assetsError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,

  assets: state.infoblox.assets,
 	assetsError: state.infoblox.assetsError,
  assetsFetch: state.infoblox.assetsFetch
}))(Manager);
