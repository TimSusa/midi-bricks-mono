import WebMIDI from 'webmidi'
// import { debounce } from 'lodash'
import { debounce } from 'debounce'
import { Actions } from './slider-list'

const {initMidiAccessPending, midiMessageArrived, initFailed, initMidiAccessOk} = Actions

export function initApp (mode) {
  return function (dispatch, getState) {
    return new Promise((resolve, reject) => {
      WebMIDI.disable()
      dispatch(initMidiAccessPending('start'))

      WebMIDI.enable((err) => {
        if (err) {
          // eslint-disable-next-line no-alert
          // window.alert('Midi could not be enabled.', err)
          reject(dispatch(initFailed('Midi could not be enabled.')))
        }
        const { inputs = [], outputs = [] } = WebMIDI
        // const { sliders: { sliderList, pages  } } = getState()
        inputs && Array.isArray(inputs) && WebMIDI.removeListener()
        inputs.forEach((input) => {
          const { name } = input
          // const { ccChannels, noteChannels } = availableInputs[name] || {
          //   ccChannels: [],
          //   noteChannels: []
          // }
          // let ccArr = []

          // Either only sliderlist
          // !pages &&
          // Array.isArray(sliderList) &&
          // sliderList.forEach((entry) => {
          //   const { driverNameInput = '', listenToCc = [] } = entry

          //   if (name === driverNameInput) {
          //     listenToCc.forEach((listen) => {
          //       // if (!ccArr.includes(listen)) {
          //       //   ccArr.push(parseInt(listen, 10))
          //       // }
          //     })
          //   }
          // })

          // Or pages
          // Object.values(pages || []).forEach((item) => {
          //   const { sliderList:sliderListLocal } = item
          //   Array.isArray(sliderListLocal) &&
          //   sliderList.forEach((entry) => {
          //     const { driverNameInput = '', listenToCc = [] } = entry

          //     if (name === driverNameInput) {
          //       listenToCc.forEach((listen) => {
          //         // if (!ccArr.includes(listen)) {
          //         //   ccArr.push(parseInt(listen, 10))
          //         // }
          //       })
          //     }
          //   })
          // })
          input.removeListener()
          // input.removeListener('controlchange')
          // console.log('cc all')
          input.addListener(
            'controlchange',
            'all',
            debounce(({ value, channel, controller: { number } }) => {
              const obj = {
                isNoteOn: undefined,
                val: value,
                cC: number,
                channel,
                driver: name
              }
              const myAction = (payload) => ({
                type: 'MIDI_MESSAGE_ARRIVED',
                payload,
                meta: {
                  raf: true
                }
              })
              // dispatch(midiMessageArrived(obj))

              // Seems to perform in less time
              dispatch(myAction(obj))
            }, 2)
          )

          input.removeListener('noteon')
          // console.log('Add note listener ALL', name, ' ', ccArr)
          input.addListener(
            'noteon',
            'all',
            debounce((event) => {
              const {rawVelocity, channel, note: { number }} = event
              const obj = {
                isNoteOn: true,
                val: rawVelocity,
                cC: number,
                channel,
                driver: name
              }
              dispatch(midiMessageArrived(obj))
            }, 5)
          )
          input.removeListener('noteoff')
          // console.log('Add note off listener ALL', name, ' ', ccArr)
          input.addListener(
            'noteoff',
            'all',
            debounce((event) => {
              const {rawVelocity, channel, note: { number }} = event
              const obj = {
                isNoteOn: false,
                val: rawVelocity,
                cC: number,
                channel,
                driver: name
              }
              dispatch(midiMessageArrived(obj))
            }, 5)
          )
        })
        if (hasContent(outputs) || hasContent(inputs)) {
          const midiAccess = {
            inputs: inputs.map((e) => e.name),
            outputs: outputs.map((e) => e.name)
          }
          dispatch(initMidiAccessOk({ midiAccess}))
          resolve(midiAccess)
        } else {
          resolve(dispatch(initFailed('No Midi Output available.')))
        }
      })
    })
  }
}

function hasContent (arr) {
  return arr.length > 0
}
