import React, { useRef, useState, useEffect } from 'react'
import createSelector from 'selectorator'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Actions as MidiSliderActions } from '../../actions/slider-list.js'
import debounce from 'debounce'
// import { debounce } from 'lodash'
import { PropTypes } from 'prop-types'

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MidiSlider)

const noop = () => {}

function MidiSlider(props) {
  const [isActivated, setIsActivated] = useState(false)
  let selfRef = useRef(null)
  let parentRectLength = useRef(null)
  let onPointerMove = useRef(null)
  let isDragging = useRef(false)
  let send = useRef(null)

  useEffect(() => {
    send.current = debounce(sendOutFromChildren, 3)
  }, [])

  const {
    isHorz,
    val,
    entry: {
      isDisabled,
      height,
      sliderThumbHeight,
      width,
      colors: { color, colorActive },
      maxVal,
      minVal
    }
  } = props
  const hOrW = isHorz ? width : height
  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        return false
      }}
      ref={selfRef}
      onPointerDown={isDisabled ? noop : handlePointerStart}
      onPointerMove={isDisabled ? noop : onPointerMove.current}
      onPointerUp={isDisabled ? noop : handlePointerEnd}
      onPointerCancel={isDisabled ? noop : handlePointerEnd}
      onGotPointerCapture={isDisabled ? noop : onGotCapture}
      onLostPointerCapture={isDisabled ? noop : onLostCapture}
      style={{
        height: !isHorz ? height + sliderThumbHeight / 2 : height,
        width: isHorz ? width + sliderThumbHeight / 2 : width,
        borderRadius: 3,
        background: color ? color : 'aliceblue',
        boxShadow: isActivated && '0 0 3px 3px rgb(24, 164, 157)',
        transform: isHorz ? 'scale(-1, 1)' : 'none'
      }}
    >
      <div style={getSliderThumbStyle(valToCood(hOrW, val, maxVal))} />
    </div>
  )

  function handlePointerStart(e) {
    selfRef.current.focus()
    onPointerMove.current = onPointerMove && handlePointerMove
    isDragging.current = true
    selfRef.current.setPointerCapture(e.pointerId)

    // Should be set before calling heightToVal()
    const {left, top} = selfRef.current.getBoundingClientRect()
    parentRectLength.current = isHorz
      ? left
      : top

    const val = isHorz ? widthToVal(e) : heightToVal(e)
    send.current(val, props)
  }

  function handlePointerEnd(e) {
    onPointerMove = null
    selfRef.current.releasePointerCapture(e.pointerId)
    const val = isHorz ? widthToVal(e) : heightToVal(e)
    send.current(val, props)
    isDragging.current = false
  }

  function handlePointerMove(e) {
    if (!isDragging.current) {
      return
    }
    const val = isHorz ? widthToVal(e) : heightToVal(e)
    //if (isNaN(val)) return
    send.current(val, props)
  }

  function onGotCapture(event) {
    setIsActivated(true)
  }
  function onLostCapture(event) {
    setIsActivated(false)
  }

  function getSliderThumbStyle(thumbLocation) {
    return {
      position: 'relative',
      cursor: 'pointer',
      height: isHorz ? '100%' : sliderThumbHeight,
      width: !isHorz ? '100%' : sliderThumbHeight,
      borderRadius: 3,
      background: colorActive ? colorActive : 'goldenrod',
      top: isHorz ? 0 : thumbLocation,
      left: !isHorz ? 0 : thumbLocation,
      boxShadow: isActivated && '0 0 3px 3px rgb(24, 164, 157)'
    }
  }

  function heightToVal(e) {
    const tmpY = e.clientY - parentRectLength.current - sliderThumbHeight / 2
    const tmpYy = tmpY < 0 ? 0 : tmpY
    const y = tmpYy >= height ? height : tmpYy
    const val = (1 - y / height) * maxVal
    const nVal = val > minVal ? val : minVal
    return nVal
  }

  function widthToVal(e) {
    const tmpY = e.clientX - parentRectLength.current 
    const tmpYy = tmpY < 0 ? 0 : tmpY
    const y = tmpYy >= width ? width : tmpYy
    const val = (y / width) * maxVal
    const nVal = val > minVal ? val : minVal
    return nVal
  }
}

MidiSlider.propTypes = {
  actions: PropTypes.object,
  entry: PropTypes.object,
  height: PropTypes.any,
  width: PropTypes.any,
  isDisabled: PropTypes.bool,
  isHorz: PropTypes.bool,
  lastFocusedPage: PropTypes.string,
  sliderEntry: PropTypes.object,
  sliderThumbHeight: PropTypes.any,
  val: PropTypes.any
}

const getSliderEntr = ({
  isDisabled,
  height,
  sliderThumbHeight,
  width,
  sliderEntry: {
    colors: { color, colorActive },
    val,
    maxVal,
    minVal
  }
}) => ({
  isDisabled,
  height,
  sliderThumbHeight,
  width,
  colors: { color, colorActive },
  val,
  maxVal,
  minVal
})
const getSliderEntry = createSelector(
  [getSliderEntr],
  ({
    isDisabled,
    height,
    sliderThumbHeight,
    width,
    colors: { color, colorActive },
    val,
    maxVal,
    minVal
  }) => ({
    isDisabled,
    height,
    sliderThumbHeight,
    width,
    colors: { color, colorActive },
    val,
    maxVal,
    minVal
  })
)

const getLastFocus = ({ viewSettings }) => viewSettings.lastFocusedPage
const getLastFocusedPage = createSelector(
  [getLastFocus],
  (lastFocusedPage) => lastFocusedPage
)
const getMemVal = createSelector(
  [getSliderEntry],
  ({ val }) => val
)
const getEntry = createSelector(
  [getSliderEntry],
  ({
    isDisabled,
    height,
    sliderThumbHeight,
    width,
    colors: { color, colorActive },
    maxVal,
    minVal
  }) => ({
    isDisabled,
    height,
    sliderThumbHeight,
    width,
    colors: { color, colorActive },
    maxVal,
    minVal
  })
)
function mapStateToProps(state, props) {
  return {
    lastFocusedPage: getLastFocusedPage(state),
    entry: getEntry(props),
    val: getMemVal(props)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(MidiSliderActions, dispatch)
  }
}

function valToCood(cood, val, maxVal) {
  return cood * (1 - val / maxVal)
}
function sendOutFromChildren(y, props) {
  return props.actions.handleSliderChange({
    i: props.sliderEntry.i,
    val: parseInt(y, 10),
    lastFocusedPage: props.lastFocusedPage
  })
}