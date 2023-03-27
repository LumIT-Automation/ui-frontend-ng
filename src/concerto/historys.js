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
          {this.authorizators(this.props.authorizationsInfoblox) ?
            <Radio.Button value={'infoblox'}>infoblox</Radio.Button>
          :
            null
          }

          { this.authorizators(this.props.authorizationsCheckpoint) ?
            <Radio.Button value={'checkpoint'}>checkpoint</Radio.Button>
          :
            null
          }

          { this.authorizators(this.props.authorizationsF5) ?
            <Radio.Button value={'f5'}>f5</Radio.Button>
          :
            null
          }

          { this.authorizators(this.props.authorizationsVmware) ?
            <Radio.Button value={'vmware'}>vmware</Radio.Button>
          :
            null
          }
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
}))(Historys);
