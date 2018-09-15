import React from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as MidiSliderActions from '../../../actions/slider-list.js'

class MidiSlider extends React.Component {
  static defaultProps = {
    height: 0
  }
  render () {
    const { sliderEntry: { val }, idx, height, width } = this.props
    const { classes } = this.props
    const tmpH = (height || 0) - 65
    return (
      <div style={{ height, width }} onContextMenu={this.preventCtxMenu}>
        <div
          className={classes.rangeSliderWrapper}
          style={{ height: tmpH }}
        >
          <input
            style={{ width: tmpH }}
            onChange={this.handleSliderChange.bind(this, idx)}
            type='range'
            max={127}
            min={0}
            step={1}
            value={val}
            className={classes.input}
          />
        </div>
        <Typography className={classes.caption}>{val}</Typography>
      </div>
    )
  }

  handleSliderChange = (idx, e, val) => {
    // e.preventDefault()
    this.props.actions.handleSliderChange({ idx, val: e.target.value })
  }

  // For touch-devices, we do not want
  // context menu being shown on touch events
  preventCtxMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

const styles = theme => ({

  rangeSliderWrapper: {
    appearance: 'none',
    height: 280
  },

  input: {
    '&[type=range]': {
      appearance: 'none',
      transform: 'rotate(-90deg)',
      transformOrigin: '0 50%',
      width: 280,

      position: 'absolute',
      padding: 0,
      margin: 0,
      bottom: 0,

      '&[orient=vertical]': {
        '-webkit-appearance': 'slider-vertical',
        writingMode: 'bt-lr'
      },

      '&::-webkit-slider-runnable-track': {
        appearance: 'none',
        height: 70,
        background: '#ddd',
        border: 'none',
        borderRadius: 3,
        cursor: 'pointer',

        '&:active': {
          background: '#eee'
          // boxShadow: '0 0 3px 3px rgb(24, 164, 157)'
        }
      },

      '&::-webkit-slider-thumb': {
        appearance: 'none',
        border: 'none',
        height: 70,
        width: 30,
        background: 'goldenrod',

        '&:active': {
          boxShadow: '0 0 3px 3px rgb(24, 164, 157)'
        }
      },

      '&:focus': {
        outline: 'none'
      }
    }

  },

  caption: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing.unit,
    color: theme.palette.primary.contrastText,
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.375em'
  }
})

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(MidiSliderActions, dispatch)
  }
}

export default (withStyles(styles)(connect(null, mapDispatchToProps)(MidiSlider)))
