import React from 'react'
import { connect } from 'react-redux'
import { Radio, Divider } from 'antd';

import Authorizators from '../_helpers/authorizators'
import History from './history'

import 'antd/dist/antd.css';
import '../App.css'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Historys extends React.Component {

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

  authorizators = a => {
    let author = new Authorizators()
    return author.isObjectEmpty(a)
  }


  render() {
    console.log(this.state.vendor)
    return (
      <React.Fragment>
        <Radio.Group
          onChange={e => this.setState({vendor: e.target.value})}
          value={this.state.vendor}
          style={{padding: 15, paddingTop: 40 }}
        >
          <Radio.Button value={'infoblox'}>infoblox</Radio.Button>
          <Radio.Button value={'checkpoint'}>checkpoint</Radio.Button>
          <Radio.Button value={'f5'}>f5</Radio.Button>
          <Radio.Button value={'vmware'}>vmware</Radio.Button>
        </Radio.Group>
        <Divider/>
        {
          this.state.vendor ?
            <History vendor={this.state.vendor}/>
          :
            null
        }
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsCheckpoint: state.authorizations.checkpoint,
  authorizationsF5: state.authorizations.f5,
  authorizationsVmware: state.authorizations.vmware,

  infobloxLoading: state.infoblox.historysLoading,
  checkpointLoading: state.checkpoint.historysLoading,
  f5Loading: state.f5.historysLoading,
  vmwareLoading: state.vmware.historysLoading,

}))(Historys);
