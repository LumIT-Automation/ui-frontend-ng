import React, { PureComponent, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { VectorMap } from '@south-paw/react-vector-maps'
import italy from './italy.json'

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




  const style = { margin: '1rem auto', fill: '#a82b2b', outline: 'none' }

  const [hovered, setHovered] = useState('None')
  const [focused, setFocused] = useState('None')
  const [clicked, setClicked] = useState('None')
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

  const layerProps = {
    onMouseEnter: ({ target }) => setHovered(target.attributes.name.value),
    onMouseLeave: ({ target }) => setHovered('None'),
    onFocus: ({ target }) => setFocused(target.attributes.name.value),
    onBlur: ({ target }) => setFocused('None'),
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
            <VectorMap {...italy} layerProps={layerProps} />
            <hr />
            <p>Hovered: {hovered && <code>{hovered}</code>}</p>
            <p>Focused: {focused && <code>{focused}</code>}</p>
            <p>Clicked: {clicked && <code>{clicked}</code>}</p>
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
