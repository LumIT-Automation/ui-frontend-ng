import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'

import Ip from './ip'

import { Tree, Table, Input, Button, Space, Spin, Modal, Collapse, Row, Col } from 'antd'

import Highlighter from 'react-highlight-words'
import { LoadingOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

const { Panel } = Collapse



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
        //this.props.dispatch( setTree(resp) )
        
        this.setState({ipv4Info: resp.data[1].ipv4Info, ipLoading: false})
      },
      error => {
        this.setState({error: error, ipLoading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/network/${network}/?related=ip`, this.props.token)
    //this.props.dispatch(setTreeLoading(false))
    //this.setState({visible: true})
  }

  resetError = () => {
    this.setState({ error: null})
  }

  onSelect = (selectedKeys, info) => {
    
    if (info.node.type === 'network') {
      let n = info.node.network
      n = n.split('/')
      n = n[0]
      this.fetchIps(n)
      this.setState({ network: n})
    }
    else {
      alert('nnnnnnnnnnn')
    }
    //this.setState({visible: true})
  }

  onCheck = (checkedKeys, info) => {
    ;
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
        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.infoblox.asset,

  tree: state.infoblox.tree
}))(List);
