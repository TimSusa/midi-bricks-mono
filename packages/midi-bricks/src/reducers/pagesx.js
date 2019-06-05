import { createNextState } from 'redux-starter-kit'
import { ActionTypePages } from '../actions/pagesx'
import { pagesInit } from '.'

export const pagesx = {
  [ActionTypePages.CREATE_PAGE](state, action) {
    const { id } = action.payload

    return createNextState(state, (draftState) => {
      draftState[id] = {
        sliderList: [],
        id,
        label: `Page ${Object.keys(state).length + 1}`
      }
      return draftState
    })
  },
  [ActionTypePages.UPDATE_PAGES](state, action) {
    const { pages } = action.payload
    return createNextState(state, (draftState) => {
      draftState = pages
      return draftState
    })
  },
  [ActionTypePages.UPDATE_SLIDER_LIST_OF_PAGE](state, action) {
    const { lastFocusedPage, sliderList } = action.payload
    return createNextState(state, (draftState) => {
      if (draftState[lastFocusedPage]) {
        draftState[lastFocusedPage].sliderList = sliderList
      }
      return draftState
    })
  },

  // TODO: this is not clean
  [ActionTypePages.DELETE_PAGES](state, action) {
    return createNextState(state, (draftState) => {
      draftState = pagesInit
      return draftState
    })
  }
}
