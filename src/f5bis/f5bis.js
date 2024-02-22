import React from 'react'
import { connect } from 'react-redux'
import { Space, Radio, Alert, Divider } from 'antd'
import 'antd/dist/antd.css';
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'

import {
  err
} from '../concerto/store'

import AssetSelector from '../concerto/assetSelector'
import ItemsView from './itemsView'

import {
  assets,
} from '../f5bis/store'



class Manager extends React.Component {

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
        error = Object.assign(error, {
          component: 'f5bis',
          vendor: 'f5',
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
        this.setState( {loading: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'f5bis') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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
                onChange={e => this.setState({items: e.target.value})}
                value={this.state.items}
                style={{marginLeft: 16}}
              >
                <Radio.Button value={'nodes'}>nodes</Radio.Button>
                <Radio.Button value={'monitors'}>monitors</Radio.Button>
                <Radio.Button value={'snatpools'}>snatpools</Radio.Button>
                <Radio.Button value={'pools'}>pools</Radio.Button>
                <Radio.Button value={'irules'}>irules</Radio.Button>
                <Radio.Button value={'certificates'}>certificates</Radio.Button>
                <Radio.Button value={'keys'}>keys</Radio.Button>
                <Radio.Button value={'profiles'}>profiles</Radio.Button>
              </Radio.Group>

              <Divider/>
        
              {
                this.state.items ?
                  <ItemsView vendor='f5' items={this.state.items} item={this.state.items.slice(0, -1)}/>
                :
                  null
              }
            </React.Fragment>
          }
          
        </Space>

        {errors()}

      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5bis,
  error: state.concerto.err,

  asset: state.f5bis.asset,
  partition: state.f5bis.partition,
}))(Manager);
