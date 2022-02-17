import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest"

import Ip from './ip'

import { Tree, Space, Collapse, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'



class List extends React.Component {

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


  closeModal = () => {
    this.setState({
      visible: false,
    })
  }

  fetchIps = async network => {
    this.setState({ipLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        //this.props.dispatch( tree(resp) )

        this.setState({ipv4Info: resp.data[1].ipv4Info, ipLoading: false})
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
      let n = info.node.title
      n = n.split('/')
      n = n[0]
      this.setState({ network: n}, () => this.fetchIps(n))
    }
  }

  onCheck = (checkedKeys, info) => {
  }

  render() {


    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Row gutter={200}>
          <Col>
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
          <Col >
            { this.state.network ?
              <Ip ipLoading={this.state.ipLoading} ipv4Info={this.state.ipv4Info} />
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
}))(List);
