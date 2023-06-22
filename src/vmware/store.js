import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const vmwareSlice = createSlice({
    name: 'vmware',
    initialState: {},
    reducers: {
        environment: (state, action) => {
          state.environment = action.payload
        },
        environmentError: (state, action) => {
          state.environmentError = action.payload
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
        assetsError: (state, action) => {
          state.assetsError = action.payload
        },

        asset: (state, action) => {
          state.asset = action.payload
        },

        datacentersError: (state, action) => {
          state.datacentersError = action.payload
        },
        clustersError: (state, action) => {
          state.clustersError = action.payload
        },
        clusterError: (state, action) => {
          state.clusterError = action.payload
        },
        foldersError: (state, action) => {
          state.foldersError = action.payload
        },
        templatesError: (state, action) => {
          state.templatesError = action.payload
        },
        templateError: (state, action) => {
          state.templateError = action.payload
        },
        customSpecsError: (state, action) => {
          state.customSpecsError = action.payload
        },
        customSpecError: (state, action) => {
          state.customSpecError = action.payload
        },
        bootstrapkeysError: (state, action) => {
          state.bootstrapkeysError = action.payload
        },
        finalpubkeysError: (state, action) => {
          state.finalpubkeysError = action.payload
        },
        vmCreateError: (state, action) => {
          state.vmCreateError = action.payload
        },


        taskProgressLoading: ( state, action) => {
          state.taskProgressLoading = action.payload
        },
        secondStageProgressLoading: ( state, action) => {
          state.secondStageProgressLoading = action.payload
        },


        genericError: ( state, action) => {
          state.genericError = action.payload
        },

        resetObjects: (state, action) => {
          state.asset = null
        },

        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = vmwareSlice;

export const {
  environment,
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,

  datacentersError,
  clustersError,
  clusterError,
  foldersError,
  templatesError,
  templateError,
  customSpecsError,
  customSpecError,
  bootstrapkeysError,
  finalpubkeysError,
  vmCreateError,

  taskProgressLoading,
  secondStageProgressLoading,

  genericError,

  resetObjects,
  cleanUp
} = actions

export default reducer
