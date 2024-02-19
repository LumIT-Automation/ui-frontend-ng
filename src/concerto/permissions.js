import React from 'react'
import { connect } from 'react-redux'
import { Radio, Divider} from 'antd'
import 'antd/dist/antd.css'
import '../App.css'

import Authorizators from '../_helpers/authorizators'
import Permission from './permission'


class Permissions extends React.Component {

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

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }


  render() {
    return (
      <React.Fragment>
        <Radio.Group
          onChange={e => this.setState({vendor: e.target.value})}
          value={this.state.vendor}
          style={{padding: 15, paddingTop: 40 }}
        >
          {this.props.authorizations && this.authorizatorsSA(this.props.authorizations) ?
            <Radio.Button value={'superAdmin'}>superAdmin</Radio.Button>
          :
            null
          }

          { this.props.authorizations && this.authorizatorsSA(this.props.authorizations) ?
            <Radio.Button value={'workflow'}>workflow</Radio.Button>
          :
            null
          }
        </Radio.Group>

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

          { this.authorizators(this.props.authorizationsProofpoint) ?
            <Radio.Button value={'proofpoint'}>proofpoint</Radio.Button>
          :
            null
          }

          { this.authorizators(this.props.authorizationsVmware) ?
            <Radio.Button value={'vmware'}>vmware</Radio.Button>
          :
            null
          }
          { this.authorizators(this.props.authorizationsFortinetdb) ?
            <Radio.Button value={'fortinetdb'}>fortinetdb</Radio.Button>
          :
            null
          }
        </Radio.Group>

        <Divider/>

        {
          this.state.vendor ?
            <Permission vendor={this.state.vendor}/>
          :
            null
        }
      </React.Fragment>
    )
  }
  }


  export default connect((state) => ({
  authorizations: state.authorizations,
  authorizationsInfoblox: state.authorizations.infoblox,
  authorizationsCheckpoint: state.authorizations.checkpoint,
  authorizationsF5: state.authorizations.f5,
  authorizationsProofpoint: state.authorizations.proofpoint,
  authorizationsVmware: state.authorizations.vmware,
  authorizationsFortinetdb: state.authorizations.fortinetdb,
  }))(Permissions);
