import React from 'react'
import {Link, withRouter} from 'react-router-dom'
import { Breadcrumb } from 'antd';

/*
Maybu it will be useful in the future.
Anyway it render as a link the actual route.
*/

function CustomBreadcrumb(props) {

  const path = props.history.location.pathname
  //const paths = path.split('/')

  return (
    <div>
    <Breadcrumb style={{ margin: '16px 0' }}>
      <Breadcrumb.Item><Link to={path}>{path}</Link></Breadcrumb.Item>
      {/*<Breadcrumb.Item><Link to={`${paths[1]}/${paths[2]}`}>{paths[2]}</Link></Breadcrumb.Item>*/}
    </Breadcrumb>
    </div>
  )
}


export default withRouter(CustomBreadcrumb)
