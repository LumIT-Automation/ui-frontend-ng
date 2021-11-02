import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest";
import Error from '../../error'
import { useLocation } from 'react-router-dom'

import { setError } from '../../_store/store.error'
import {
  setAssetsLoading,
  setAssets,
  setAssetsFetch
} from '../../_store/store.f5'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    if (!this.props.assets) {
      this.fetchAssets()
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assetsFetch) {
      this.fetchAssets()
      this.props.dispatch(setAssetsFetch(false))
    }
  }

  componentWillUnmount() {
  }

  usePathname = () => {
    const location = useLocation();
    console.log('location');
    console.log(location);
    //return location.pathname;
  }

  fetchAssets = async () => {
    this.props.dispatch(setAssetsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setAssets( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR("f5/assets/", this.props.token)
    this.props.dispatch(setAssetsLoading(false))
  }


  render() {

    return (
      <React.Fragment>
        { this.props.error ?
          <Error error={[this.props.error]} />
        :
          <React.Fragment>
            <br/>
            { this.props.authorizations && (this.props.authorizations.assets_post || this.props.authorizations.any) ?
              <React.Fragment>
                <Add/>
                <br/>
                <br/>
              </React.Fragment>
            :
              null
            }
            <List/>
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  assets: state.f5.assets,
  assetsFetch: state.f5.assetsFetch
}))(Manager);
