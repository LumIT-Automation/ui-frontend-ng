import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Error from '../error'
import Rest from '../../_helpers/Rest'

import {
  historysLoading,
  historys,
  historysFetch,
  historysError,

} from '../store.f5'

import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (!this.props.historysError) {
      this.props.dispatch(historysFetch(false))
      if (!this.props.historys) {
        this.main()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.historysFetch) {
      this.main()
      this.props.dispatch(historysFetch(false))
    }
  }

  componentWillUnmount() {
  }


  main = async () => {
    this.props.dispatch(historysLoading(true))

    let fetchedHistorys = await this.fetchHistorys()
    if (fetchedHistorys.status && fetchedHistorys.status !== 200 ) {
      this.props.dispatch(historysError(fetchedHistorys))
      this.props.dispatch(historysLoading(false))
      return
    }
    else {
      this.props.dispatch(historysLoading(false))
      this.props.dispatch(historys(fetchedHistorys))
    }
  }


  fetchHistorys = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR("f5/history/", this.props.token)
    return r
  }

  render() {
    return (
      <React.Fragment>

        <List/>

        { this.props.historysError ? <Error component={'manager f5'} error={[this.props.historysError]} visible={true} type={'historysError'} /> : null }
        
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  historys: state.f5.historys,
  historysError: state.f5.historysError,
  historysFetch: state.f5.historysFetch,

}))(Manager);
