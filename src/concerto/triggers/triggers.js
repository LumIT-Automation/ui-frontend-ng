import React from 'react'
import { connect } from 'react-redux'
import { Radio, Divider } from 'antd';

import Authorizators from '../../_helpers/authorizators'
import Trigger from './trigger'

import 'antd/dist/antd.css';
import '../../App.css'
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

        </Radio.Group>

        <Divider/>

        {
          this.state.vendor ?
            <Trigger vendor={this.state.vendor}/>
          :
            null
        }
      </React.Fragment>
    )
  }
}


export default connect((state) => ({
  authorizationsInfoblox: state.authorizations.infoblox,
}))(Historys);
