import { batch } from 'react-redux'
import { Actions as sliderListActions } from '../slider-list'
// import { Actions as viewSettingsActions } from '../view-settings'
import { Actions as pageActions } from '../pagesx'

const { changeListOrder } = sliderListActions
//const { setLastFocusedPage, setLastFocusedIndex, addPageTarget } = viewSettingsActions
const { updateSliderListOfPage } = pageActions

export function thunkChangeListOrder(listOrder, lastFocusedPage) {
  return async function(dispatch, getState) {
    const {
      viewSettings: { lastFocusedPage },
      sliders: {
        present: { sliderList }
      }
    } = getState()

    const mergedList = sliderList.reduce((acc, cur) => {
      const orderEntry = listOrder.find((er) => er.i === cur.i)
      if (orderEntry) {
        acc.push({ ...cur, ...orderEntry })
      }
      return acc
    }, [])
    batch(() => {
      dispatch(changeListOrder({ listOrder, lastFocusedPage }))
      dispatch(
        updateSliderListOfPage({ lastFocusedPage, sliderList: mergedList })
      )
    })
  }
}
