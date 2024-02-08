import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { Tabs, Space, Spin, Divider } from 'antd'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'

import AssetSelector from '../concerto/assetSelector'
import CertificatesManager from './f5/certificates/manager'
import KeysManager from './f5/keys/manager'

import {
  assets,
  certificatesFetch,
  keysFetch
} from '../f5/store'

import {
  err
} from '../concerto/store'

const { TabPane } = Tabs;
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class CertificatesAndKeys extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidMount() {
    console.log('certif MOUNT', this.props.error)
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
          component: 'certKey manager f5',
          vendor: 'f5',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }


  certificatesRefresh = () => {
    this.props.dispatch(certificatesFetch(true))
  }

  keysRefresh = () => {
    this.props.dispatch(keysFetch(true))
  }


  render() {
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center', padding: 24}}>
        <Tabs type="card">
          <TabPane tab="F5" key="2">
            {this.state.loading ? <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
            <React.Fragment>
              <AssetSelector vendor='f5'/>
              <Divider/>
              <Tabs type="card">
                { this.props.authorizations && (this.props.authorizations.certificates_get || this.props.authorizations.any) ?
                  <React.Fragment>
                    {this.props.certificatesLoading ?
                      <TabPane key="Certificates" tab="Certificates">
                        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                      </TabPane>
                      :
                      <TabPane key="Certificates" tab=<span>Certificates <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.certificatesRefresh()}/></span>>
                        <CertificatesManager/>
                      </TabPane>
                    }
                  </React.Fragment>
                  :
                  null
                }
                {/*certificates_get da sostituire con keys_get*/}
                { this.props.authorizations && (this.props.authorizations.certificates_get || this.props.authorizations.any) ?
                  <React.Fragment>
                    {this.props.keysLoading ?
                      <TabPane key="Keys" tab="Keys">
                        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
                      </TabPane>
                      :
                      <TabPane key="Keys" tab=<span>Keys <ReloadOutlined style={{marginLeft: '10px' }} onClick={() => this.keysRefresh()}/></span>>
                        <KeysManager/>
                      </TabPane>
                    }
                  </React.Fragment>
                  :
                  null
                }


              </Tabs>
            </React.Fragment>
            }
          </TabPane>
        </Tabs>

        { 
          (this.props.error && 
            this.props.error.component === 'certKey manager f5') ? 
            <Error error={[this.props.error]} visible={true}/> 
          : 
            null        
        }

      </Space>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  error: state.concerto.err,

  certificatesLoading: state.f5.certificatesLoading,
  keysLoading: state.f5.keysLoading,


  asset: state.f5.asset
}))(CertificatesAndKeys);
