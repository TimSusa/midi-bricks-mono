import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles, useTheme } from '@material-ui/styles'
// import MidiSliderClassic from '../midi-elements/MidiSliderClassic'
import MidiSlider  from '../midi-elements/MidiSlider'
import MidiButtons from '../midi-elements/midi-buttons/MidiButtons'
import StripLabel from '../midi-elements/StripLabel'
import { STRIP_TYPE } from '../../reducers/slider-list'
import MidiSliderHorz from '../midi-elements/MidiSliderHorz'
import XyPad from '../XyPad'
import { Label } from '../midi-elements/Label'
export default ChannelStrip

const sliderThumbHeight = 30


ChannelStrip.propTypes = {
  classes: PropTypes.object,
  isDisabled: PropTypes.bool,
  isMidiLearnMode: PropTypes.any,
  size: PropTypes.object,
  sliderEntry: PropTypes.object
}

function ChannelStrip(props) {
  const theme = useTheme()
  const classes = makeStyles(styles.bind(this, theme))()
  const { sliderEntry, size, isDisabled, isMidiLearnMode } = props
  const {
    i,
    type,
    label,
    val,
    fontSize,
    fontWeight,
    colors: { colorFont } = {},
    isValueHidden,
    lastSavedVal
  } = sliderEntry
  const tmpH = (size && size.height) || 0
  const tmpW = (size && size.width) || 0
  const isButton = ![STRIP_TYPE.SLIDER, STRIP_TYPE.SLIDER_HORZ, STRIP_TYPE.LABEL].includes(type)
  return (
    <div className={classes.root}>
      {type === STRIP_TYPE.SLIDER && !isMidiLearnMode && (
        <div className={classes.sliderChannelWrapper}>
          <Label
            fontSize={fontSize}
            fontWeight={fontWeight}
            labelStyle={classes.label}
            colorFont={colorFont}
            {...props}
          >
            {label}
          </Label>
          <MidiSlider
            className={classes.sliderWrapper}
            isDisabled={isDisabled}
            sliderEntry={sliderEntry}
            height={calcHeight(tmpH, props)}
            width={tmpW}
            sliderThumbHeight={sliderThumbHeight}
          />
          {!isValueHidden && (
            <Label
              lastSavedVal={lastSavedVal}
              i={i}
              fontSize={fontSize}
              fontWeight={fontWeight}
              labelStyle={classes.bottomLabel}
              colorFont={colorFont}
              {...props}
            >
              {val}
              {` / ${lastSavedVal}`}
            </Label>
          )}
        </div>
      )}
      {type === STRIP_TYPE.SLIDER_HORZ && (
        <div className={classes.sliderChannelWrapper}>
          <Label
            fontSize={fontSize}
            fontWeight={fontWeight}
            labelStyle={classes.label}
            colorFont={colorFont}
            {...props}
          >
            {label}
          </Label>
          <MidiSliderHorz
            className={classes.sliderWrapper}
            isDisabled={isDisabled}
            sliderEntry={sliderEntry}
            i={i}
            height={calcHeight(tmpH, props)}
            width={tmpW - sliderThumbHeight}
            sliderThumbHeight={sliderThumbHeight}
          />
          {!isValueHidden ? (
            <Label
              lastSavedVal={lastSavedVal}
              i={i}
              fontSize={fontSize}
              fontWeight={fontWeight}
              labelStyle={classes.bottomLabel}
              colorFont={colorFont}
              {...props}
            >
              {val}
              {` / ${lastSavedVal}`}
            </Label>
          ) : null}
        </div>
      )}
      {isButton && (
        <MidiButtons
          isDisabled={isDisabled}
          sliderEntry={sliderEntry}
          height={tmpH}
          width={tmpW}
        />
      )}
      {type === STRIP_TYPE.LABEL && (
        <StripLabel
          isDisabled={isDisabled}
          sliderEntry={sliderEntry}
          height={tmpH}
          width={tmpW}
        />
      )}
      {type === STRIP_TYPE.XYPAD && (
        <XyPad
          isDisabled={isDisabled}
          classes={classes}
          sliderEntry={sliderEntry}
          height={tmpH}
          width={tmpW}
        />
      )}
    </div>
  )
}

function calcHeight(tmpH, props) {
  const fact = props.sliderEntry.isValueHidden ? 1 : 2
  const marge = props.sliderEntry.isValueHidden ? 8 : 16
  return (
    tmpH -
    parseInt(fact * props.sliderEntry.fontSize, 10) -
    sliderThumbHeight -
    marge
  )
}

function styles(theme) {
  return {
    root: {
      userSelect: 'none'
    },
    iconColor: {
      color: theme.palette.primary.contrastText,
      cursor: 'pointer'
    },
    sliderChannelWrapper: {
      position: 'relative'
    },
    label: {
      color: theme.palette.primary.contrastText,
      textAlign: 'center',
      fontWeight: 400,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      marginBottom: 8
    },
    bottomLabel: {
      position: 'fixed',
      bottom: 0,
      width: '100%',
      color: theme.palette.primary.contrastText,
      textAlign: 'center',
      fontWeight: 400,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      lineHeight: 1
    }
  }
}
