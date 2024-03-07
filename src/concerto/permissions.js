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

  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
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
          { this.isAuthorized(this.props.authorizations, 'infoblox') ?
            <Radio.Button value={'infoblox'}>infoblox</Radio.Button>
          :
            null
          }

          { this.isAuthorized(this.props.authorizations, 'checkpoint') ?
            <Radio.Button value={'checkpoint'}>checkpoint</Radio.Button>
          :
            null
          }

          { this.isAuthorized(this.props.authorizations, 'f5') ?
            <Radio.Button value={'f5'}>f5</Radio.Button>
          :
            null
          }

          { this.isAuthorized(this.props.authorizations, 'proofpoint') ?
            <Radio.Button value={'proofpoint'}>proofpoint</Radio.Button>
          :
            null
          }

          { this.isAuthorized(this.props.authorizations, 'vmware') ?
            <Radio.Button value={'vmware'}>vmware</Radio.Button>
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
  }))(Permissions);
