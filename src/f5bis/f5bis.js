import React from 'react'
import { connect } from 'react-redux'
import { Space, Radio, Alert, Divider } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
//import Error from './error'

import AssetSelector from '../concerto/assetSelector'
import F5Elements from './elements'

import {
  assets,
  assetsError,
} from '../f5/store'



class F5 extends React.Component {

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
        this.setState( {loading: false}, () => this.props.dispatch(assets(resp)) )
      },
      error => {
        this.setState( {loading: false}, () => this.props.dispatch(assetsError(error)) )
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  render() {
    return (
      <React.Fragment>
        <AssetSelector vendor='f5'/>

        <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>
        <Space direction="vertical" style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
          {!(this.props.asset && this.props.partition) ?
            <Alert message="Asset and Partition not set" type="error" />
          :
            <React.Fragment>

              <Radio.Group
                onChange={e => this.setState({f5elements: e.target.value})}
                value={this.state.f5elements}
                style={{marginLeft: 16}}
              >
                <Radio.Button value={'nodes'}>nodes</Radio.Button>
              </Radio.Group>

              <Divider/>
        
              {
                this.state.f5elements ?
                  <F5Elements f5elements={this.state.f5elements}/>
                :
                  null
              }
            </React.Fragment>
          }
          
        </Space>

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  assetsError: state.f5.assetsError,

  asset: state.f5.asset,
  partition: state.f5.partition
}))(F5);