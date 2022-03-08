import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Tree, Space, Row, Col } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../error/infobloxError'

import IpsList from './ipsList'



class NetworksTree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      network: false,
      ipLoading: false,
      error: null
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



  ipsGet = async network => {
    this.setState({ipLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({ipv4Info: resp.data.ipv4Info, ipLoading: false})
      },
      error => {
        this.setState({error: error, ipLoading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network/${network}/?related=ip`, this.props.token)
    //this.props.dispatch(treeLoading(false))
    //this.setState({visible: true})
  }


  onSelect = (selectedKeys, info) => {
    if (info.node.type === 'network') {
      console.log(info.node)
      let n = info.node.title
      n = n.split('/')
      n = n[0]
      this.setState({ network: n}, () => this.ipsGet(n))
    }
  }

  onCheck = (checkedKeys, info) => {
  }

  render() {


    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Row>
          <Col span={6}>
            <Tree
              defaultExpandAll
              showLine
              //defaultExpandedKeys={['0-0-0', '0-0-1']}
              //defaultSelectedKeys={['0-0-0', '0-0-1']}
              //defaultCheckedKeys={['0-0-0', '0-0-1']}
              onSelect={this.onSelect}
              onCheck={this.onCheck}
              treeData={this.props.tree}
            />
          </Col>
          <Col offset={2} span={14}>
            { this.state.network ?
              <IpsList ipLoading={this.state.ipLoading} ipv4Info={this.state.ipv4Info} />
            :
              null
            }
          </Col>
        </Row>

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  asset: state.infoblox.asset,

  tree: state.infoblox.tree
}))(NetworksTree);
