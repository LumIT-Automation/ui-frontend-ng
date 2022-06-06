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
  taskProgressLoading,
  secondStageProgressLoading,
} from '../store'

import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    console.log('mount')
    if (!this.props.historysError) {
      this.props.dispatch(historysFetch(false))
      if (!this.props.historys) {
        this.main()
      }
      this.interval = setInterval( () => this.refresh(), 15000)
    }
    else {
      clearInterval(this.interval)
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(this.props.historys)
    console.log('update')
    if (this.props.historysFetch) {
      clearInterval(this.interval)
      this.main()
      this.props.dispatch(historysFetch(false))
    }
  }

  componentWillUnmount() {
    console.log('unmount')
    clearInterval(this.interval)
  }

  main = async () => {
    this.props.dispatch(historysLoading(true))
    let list = []

    let fetchedHistorys = await this.historyGet()
    if (fetchedHistorys.status && fetchedHistorys.status !== 200 ) {
      this.props.dispatch(historysError(fetchedHistorys))
      this.props.dispatch(historysLoading(false))
      return
    }
    else {
      this.props.dispatch(historysLoading(false))
      fetchedHistorys.data.items.forEach((item, i) => {
        let ts = item.task_startTime.split('.');
        item.task_startTime = ts[0]
        list.push(item)
      });

      this.props.dispatch(historys(list))
    }
  }

  refresh = async () => {

    let taskProgress = false
    let secondStage = false

    this.props.historys.forEach((item, i) => {
      if (item.second_stage_state === 'running') {
        secondStage = true
      }
      if (item.task_state === 'running') {
        taskProgress = true
      }
    });


    //second_stage_state === 'running'

    if (taskProgress) {
      this.props.dispatch(taskProgressLoading(true))
    }
    if (secondStage) {
      this.props.dispatch(secondStageProgressLoading(true))
    }

    let list = []

    let fetchedHistorys = await this.historyGet()
    this.props.dispatch(taskProgressLoading(false))
    this.props.dispatch(secondStageProgressLoading(false))

    if (fetchedHistorys.status && fetchedHistorys.status !== 200 ) {
      this.props.dispatch(historysError(fetchedHistorys))
      return
    }
    else {
      fetchedHistorys.data.items.forEach((item, i) => {
        let ts = item.task_startTime.split('.');
        item.task_startTime = ts[0]
        list.push(item)
      });
      this.props.dispatch(historys(list))
    }
  }


  historyGet = async () => {
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
    await rest.doXHR("vmware/stage2/targets/?results=10", this.props.token)
    return r
  }

  render() {
    return (
      <React.Fragment>

        <List/>

        { this.props.historysError ? <Error component={'manager vmware'} error={[this.props.historysError]} visible={true} type={'historysError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  historys: state.vmware.historys,
  historysError: state.vmware.historysError,
  historysFetch: state.vmware.historysFetch,

}))(Manager);
