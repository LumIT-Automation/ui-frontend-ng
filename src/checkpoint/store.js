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

      fetchItems: (state, action) => {
        state.fetchItems = action.payload
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

  cleanUp
} = actions

export default reducer
