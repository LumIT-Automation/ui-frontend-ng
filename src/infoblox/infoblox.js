import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Divider } from 'antd'
import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'

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
    if (this.props.authorizations && (this.props.authorizations.assets_get || this.props.authorizations.any ) ) {
      this.assetsGet()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  assetsGet = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false}, () => this.props.dispatch(assets( resp )))
      },
      error => {
        error = Object.assign(error, {
          component: 'infobloxMGMT',
          vendor: 'infoblox',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("infoblox/assets/", this.props.token)
  }

  treeRefresh = () => {
    this.props.dispatch(treeFetch(true))
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
            { this.props.authorizations && (this.props.authorizations.networks_get || this.props.authorizations.any) ?
              <React.Fragment>
                {this.state.loading ?
                  <TabPane tab='Network Tree'>
                    <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                  </TabPane>
                :
                  <TabPane tab=<span>Network Tree <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.treeRefresh()}/></span> >
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
  authorizations: state.authorizations.infoblox,
  error: state.concerto.err,
}))(Infoblox);
