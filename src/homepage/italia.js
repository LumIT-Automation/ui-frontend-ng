import React, { PureComponent, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { VectorMap } from '@south-paw/react-vector-maps'
import italyJSON from './italyJSON.json'

import Rest from '../_helpers/Rest'
import Error from '../error/fortinetdbError'

import List from '../fortinetdb/devices/list'

import {
  devices,
  field,
  fieldError,
  value,
  valueError
} from '../_store/store.fortinetdb'

import { Modal, Table, Spin } from 'antd'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


const Map = props => {

  const divStyle = {
    color: 'blue',
  };

  const style = {
    margin: '1rem auto',
    fill: '#a82b2b',
    outline: 'none',
  }

  const [hovered, setHovered] = useState('None')
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldLoading, setFieldLoading] = useState(false)
  const [valueLoading, setValueLoading] = useState(false)
  const [value, setValue] = useState('None')
  const [field, setField] = useState([])
  const [values, setValues] = useState()


  const fetchField = async () => {
    setFieldLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setField(resp.data.items)
      },
      error => {
        props.dispatch(fieldError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=regione`, props.token)
    setFieldLoading(false)
  }

  useEffect(() => {
    fetchField()
  }, [])

  const setRegionCount = region => {
    setCount(0)
    field.forEach( r => {
      if (r.regione === region) {
        if (r.COUNT) {
          setCount(r.COUNT)
        }
        else {
          setCount(0)
        }
      }
    })
  }

  const setRegionColor = region => {
    if (region.attributes.fill) {
      region.attributes.fill.value = 'pink'
    }
  }

  //fetchField()

  const fetchValues = async value => {
    setValueLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setValues(resp.data.items)
      },
      error => {
        props.dispatch(valueError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=regione&fval=${value}`, props.token)
    setValueLoading(false)
  }

  const hide = () => {
    setVisible(false)
    setValue()
    setValues([])
  }

  const events = {
    onMouseEnter: ({ target }) => {
      setRegionCount(target.attributes.name.value)
      setHovered(target.attributes.name.value)
      target.attributes.fill.value = 'yellow'
    },
    onMouseLeave: ({ target }) => {
      setRegionCount(target.attributes.name.value)
      setHovered(target.attributes.name.value)
      target.attributes.fill.value = '#a82b2b'
    },
    onClick: ({ target }) => {
      setVisible(true)
      setValue(target.attributes.name.value)
      fetchValues(target.attributes.name.value)
    }
  };


  return (
    <div style={style}>
      { fieldLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <div style={style}>
            <p>Region: {hovered && <code>{hovered}</code>}</p>
            <p>Devices: {count && <code>{count}</code>}</p>
            <hr />
            <VectorMap {...italyJSON} layerProps={events} />
          </div>
      }

        <Modal
          title={<p style={{textAlign: 'center'}}>{value}</p>}
          centered
          destroyOnClose={true}
          visible={visible}
          footer={''}
          //onOk={() => this.setState({visible: true})}
          onCancel={hide}
          width={1500}
        >
          { valueLoading ?
             <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
          :
            <React.Fragment>
              { values ?
                <List height={550} pagination={5} filteredDevices={values}/>
              :
                null
              }
            </React.Fragment>
          }
        </Modal>


      { props.fieldError ? <Error component={'homepage'} error={[props.fieldError]} visible={true} type={'fieldError'} /> : null }
      { props.valueError ? <Error component={'homepage'} error={[props.valueError]} visible={true} type={'valueError'} /> : null }

    </div>
  );
}


//export default Map

export default connect((state) => ({
  token: state.ssoAuth.token,
  fieldError: state.fortinetdb.fieldError,
  valueError: state.fortinetdb.valueError,
}))(Map);
