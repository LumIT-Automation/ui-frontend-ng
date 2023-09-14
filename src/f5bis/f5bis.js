import React from 'react'
import { connect } from 'react-redux'
import { Radio, Spin, Divider } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from './error'

import AssetSelector from '../concerto/assetSelector'
import F5Object from './object'

import {
  assets,
  assetsError,
  nodesFetch,
} from '../f5/store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



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
    //this.props.dispatch(resetObjects())
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
    console.log(this.state.f5object)
    return (
      <React.Fragment>
        <AssetSelector vendor='f5'/>

        <Divider style={{borderBottom: '3vh solid #f0f2f5'}}/>
        
        <Radio.Group
          onChange={e => this.setState({f5object: e.target.value})}
          value={this.state.f5object}
          style={{padding: 15, paddingTop: 40 }}
          disabled={!(this.props.asset && this.props.partition)}
        >
          <Radio.Button value={'nodes'}>nodes</Radio.Button>
        </Radio.Group>

        <Divider/>
      
        {
          this.state.f5object ?
            <F5Object f5object={this.state.f5object}/>
          :
            null
        }
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
