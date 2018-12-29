import { MinMaxValInput } from './MinMaxValInput'
import React from 'react'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputNoteOrCc from './InputNoteOrCc'
import {
  renderDriverSelection,
  renderMidiChannelSelection,
} from '../MidiSettings'

import { STRIP_TYPE } from '../../../../../../reducers/slider-list'

const {
  BUTTON,
  BUTTON_CC,
  BUTTON_TOGGLE,
  BUTTON_TOGGLE_CC,
  SLIDER,
  SLIDER_HORZ,
} = STRIP_TYPE

export const MidiSettingsOutput = props => {
  const {
    classes,
    actions,
    sliderEntry: {
      i,
      type,
      minVal,
      maxVal,
      onVal,
      offVal,
      driverName = 'None',
      midiChannel,
      midiCC,
    },
    idx,
    outputs,
  } = props
  return (
    <React.Fragment>
      <InputNoteOrCc midiCC={midiCC} type={type} idx={idx} />
      <FormControl className={classes.formControl}>
        <InputLabel className={classes.label} htmlFor="midi-driver">
          Driver
        </InputLabel>
        <Select
          className={classes.select}
          onChange={e =>
            actions.selectMidiDriver({
              i,
              driverName: e.target.value,
            })
          }
          value={driverName || 'None'}
        >
          {renderDriverSelection({
            outputs,
          })}
        </Select>
      </FormControl>

      <FormControl className={classes.formControl}>
        <InputLabel className={classes.label} htmlFor="output-cc-input">
          Channel
        </InputLabel>
        <Select
          className={classes.select}
          onChange={e =>
            actions.selectMidiChannel({
              idx,
              val: e.target.value,
            })
          }
          value={midiChannel || 'None'}
        >
          {renderMidiChannelSelection(
            {
              outputs,
            },
            driverName,
            type
          )}
        </Select>
      </FormControl>
      {[SLIDER, SLIDER_HORZ].includes(type) && (
        <React.Fragment>
          <MinMaxValInput
            classes={classes}
            label="Maximum Value"
            value={maxVal}
            name={`input-maxval-name-${idx}`}
            limitVal={127}
            onChange={e =>
              actions.setMaxVal({
                idx,
                val: e.target.value,
              })
            }
          />
          <MinMaxValInput
            classes={classes}
            label="Minimum Value"
            value={minVal}
            name={`input-minval-name-${idx}`}
            limitVal={0}
            onChange={e =>
              actions.setMinVal({
                idx,
                val: e.target.value,
              })
            }
          />
        </React.Fragment>
      )}
      {
        <React.Fragment>
          {[BUTTON, BUTTON_CC, BUTTON_TOGGLE, BUTTON_TOGGLE_CC].includes(
            type
          ) && (
            <React.Fragment>
              <MinMaxValInput
                classes={classes}
                label="Value Button On"
                value={onVal}
                name={`input-onval-name-${idx}`}
                limitVal={127}
                onChange={e =>
                  actions.setOnVal({
                    idx,
                    val: e.target.value,
                  })
                }
              />
              <MinMaxValInput
                classes={classes}
                label="Value Button Off"
                value={offVal}
                name={`input-offval-name-${idx}`}
                limitVal={0}
                onChange={e =>
                  actions.setOffVal({
                    idx,
                    val: e.target.value,
                  })
                }
              />
            </React.Fragment>
          )}
        </React.Fragment>
      }
    </React.Fragment>
  )
}