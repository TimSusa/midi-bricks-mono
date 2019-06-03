import { Actions as sliderListActions } from '../slider-list'
import { Actions as viewSettingsActions } from '../view-settings'
import { Actions as pageActions } from '../pagesx'
import { initApp } from '../init'

import { initId } from '../../reducers/slider-list'

const { loadFile, deleteAll } = sliderListActions
const { updateViewSettings, setLastFocusedPage } = viewSettingsActions
const { updatePages } = pageActions

export function thunkLoadFile(content, presetName) {
  return async function(dispatch, getState) {
    let promArray = []

    promArray.push(dispatch(deleteAll()))
    window.localStorage.clear()

    const {
      viewSettings = {},
      viewSettings: { availableDrivers } = {},
      sliders: { sliderList, pages } = {}
    } = content
    promArray.push(
      dispatch(loadFile({ presetName, content, lastFocusedPage: initId }))
    )

    promArray.push(dispatch(updatePages({ pages })))

    promArray.push(dispatch(setLastFocusedPage({ lastFocusedPage: initId })))

    const drivers = availableDrivers || {
      inputs: {
        None: {
          ccChannels: [],
          noteChannels: []
        }
      },
      outputs: {
        None: {
          ccChannels: [],
          noteChannels: []
        }
      }
    }

    // Either will will have pages or sliderList
    if (pages) {
      promArray.push(
        dispatch(
          updateViewSettings({
            // version,
            viewSettings: { ...viewSettings, availableDrivers: drivers },
            pages
          })
        )
      )
    }

    // Will load content to view-settings-reducer
    sliderList &&
      Array.isArray(sliderList) &&
      promArray.push(
        dispatch(
          updateViewSettings({
            // version,
            viewSettings: { ...viewSettings, availableDrivers: drivers },
            sliderList: sliderList,
            pages
          })
        )
      )
    promArray.push(dispatch(initApp()))
    return Promise.all(promArray)
  }
}
