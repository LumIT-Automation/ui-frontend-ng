import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const checkpointSlice = createSlice({
    name: 'checkpoint',
    initialState: {},
    reducers: {
      environment: (state, action) => {
        state.environment = action.payload
      },

      assetsLoading: (state, action) => {
        state.assetsLoading = action.payload
      },
      assets: (state, action) => {
        state.assets = action.payload.data.items
      },
      assetsFetch: (state, action) => {
        state.assetsFetch = action.payload
      },

      asset: (state, action) => {
        state.asset = action.payload
      },

      domainsLoading: (state, action) => {
        state.domainsLoading = action.payload
      },
      domains: (state, action) => {
        state.domains = action.payload.data.items
      },
      domainsFetch: (state, action) => {
        state.domainsFetch = action.payload
      },

      domain: (state, action) => {
        state.domain = action.payload
      },

      hosts: (state, action) => {
        state.hosts = action.payload.data.items
      },
      fetchItems: (state, action) => {
        state.fetchItems = action.payload
      },

      groups: (state, action) => {
        state.groups = action.payload.data.items
      },

      networks: (state, action) => {
        state.networks = action.payload.data.items
      },

      addressRanges: (state, action) => {
        state.addressRanges = action.payload.data.items
      },

      datacenterServersLoading: (state, action) => {
        state.datacenterServersLoading = action.payload
      },
      datacenterServers: (state, action) => {
        state.datacenterServers = action.payload.data.items
      },
      datacenterServersFetch: (state, action) => {
        state.datacenterServersFetch = action.payload
      },

      datacenterQuerysLoading: (state, action) => {
        state.datacenterQuerysLoading = action.payload
      },
      datacenterQuerys: (state, action) => {
        state.datacenterQuerys = action.payload.data.items
      },
      datacenterQuerysFetch: (state, action) => {
        state.datacenterQuerysFetch = action.payload
      },

      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = checkpointSlice;

export const {
  environment,

  assetsLoading,
  assets,
  assetsFetch,
  asset,

  domainsLoading,
  domains,
  domainsFetch,
  domain,

  fetchItems,

  hosts,
  groups,
  networks,
  addressRanges,

  datacenterServersLoading,
  datacenterServers,
  datacenterServersFetch,

  datacenterQuerysLoading,
  datacenterQuerys,
  datacenterQuerysFetch,

  cleanUp
} = actions

export default reducer
