import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { LoadingOutlined } from '@ant-design/icons';
import { Space, Alert, Spin } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  tree,
  treeFetch,
} from '../store'

import NetworksTree from './networksTree'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
    };
  }

  componentDidMount() {
    console.log('mount')
    if (this.props.asset) {
      if (!this.props.error) {
        this.props.dispatch(treeFetch(false))
        if (!this.props.tree) {
          this.treeGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && (prevProps.asset !== this.props.asset)) {
      if (!this.props.tree) {
        this.treeGet()
      }
    }
    if (this.props.asset) {
      if (this.props.treeFetch) {
        this.props.dispatch(treeFetch(false))
        this.treeGet()
      }
    }
  }

  componentWillUnmount() {
    this.props.dispatch(tree(null))
  }

  treeGet = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.editTree(resp.data['/'])
      },
      error => {
        error = Object.assign(error, {
          component: 'manager',
          vendor: 'infoblox',
          errorType: 'treeError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/tree/`, this.props.token)
    this.setState({loading: false})
  }

  editTree = async t => {
    console.log(t)
    await this.editTitle(t) 
    console.log(t)
    
    this.props.dispatch(tree([t]))
  }

  editTitle = net => {
    try {
      if (net.extattrs && (net.extattrs.Environment || net.extattrs['Object Type'])) {
        let str
        if (net.extattrs && net.extattrs.Environment) {
          str = net.extattrs.Environment.value
        }
        else {
          str = net.extattrs['Object Type'].value
        }
        net.title = `${net.title} - ${str}`
      }
  
      net.children.forEach(child => {
        this.editTitle(child)
      });
    }
    catch(error) {
      console.log(error)
    }

  }



  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'manager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>
        <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
          { this.props.asset ?
            <React.Fragment>
              {this.state.loading ?
                <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
              :
                <NetworksTree/>
              }
              
            </React.Fragment>
          :
            <Alert message="Asset not set" type="error" />
          }

        </Space>

        {errors()}

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.infoblox.asset,

  tree: state.infoblox.tree,
  treeFetch: state.infoblox.treeFetch,
}))(Manager);
