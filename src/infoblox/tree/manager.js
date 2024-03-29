import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

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



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
    };
  }

  componentDidMount() {
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
        this.treeGet()
        this.props.dispatch(treeFetch(false))
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
        let l = []
        l.push(resp.data['/'])
        this.props.dispatch(tree(l))
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
    this.setState({loading: true})
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
          { this.props.tree ?
            <NetworksTree/>
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
  authorizations: state.authorizations.infoblox,
  error: state.concerto.err,

  asset: state.infoblox.asset,

  tree: state.infoblox.tree,
  treeFetch: state.infoblox.treeFetch,
}))(Manager);
