import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd'
import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'
import Authorizators from '../_helpers/authorizators'

import {
  err
} from '../concerto/store'

import AssetSelector from '../concerto/assetSelector'
import Tree from './tree/manager'

import {
  assets,
  treeFetch
} from '../infoblox/store'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Infoblox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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

  treeRefresh = () => {
    this.props.dispatch(treeFetch(true))
  }

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'infobloxMGMT') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <AssetSelector vendor='infoblox'/>
        <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>

        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
          <Tabs type="card">
            { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'infoblox', 'networks_get')) ? 
              <React.Fragment>
                {this.state.loading ?
                  <TabPane tab='Network Tree'>
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                :
                  <TabPane tab={<span>Network Tree <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.treeRefresh()}/></span>} >
                    <Tree/>
                  </TabPane>
                }
              </React.Fragment>
            :
              null
            }
          </Tabs>
        </Space>

        {errors()}

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,
}))(Infoblox);
