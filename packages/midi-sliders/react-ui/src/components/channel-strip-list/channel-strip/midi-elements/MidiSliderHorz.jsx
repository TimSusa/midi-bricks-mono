import React from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as MidiSliderActions from '../../../../actions/slider-list.js'

class MidiSliderHorz extends React.Component {
  static defaultProps = {
    height: 0
  }
  render () {
    const { sliderEntry: { val, label }, idx, height, width } = this.props
    const { classes } = this.props
    return (
      <div style={{ height, width }}
      >
        <Typography
          className={classes.labelTop}
        >
          {label}
        </Typography>
        <div
          onContextMenu={this.preventCtxMenu}
          className={classes.rangeSliderWrapper}
          style={{ height }}
        >
          <input
            style={{ width }}
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
  labelTop: {
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    margin: '0 8px',
    textOverflow: 'ellipsis',
    color: theme.palette.primary.contrastText,
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.375em'
  },
  rangeSliderWrapper: {
    appearance: 'none'
  },

  input: {
    '&[type=range]': {
      appearance: 'none',
      borderRadius: 3,

      '&::-webkit-slider-runnable-track': {
        appearance: 'none',
        background: theme.palette.slider.trackNonactive,
        border: 'none',
        borderRadius: 3,
        cursor: 'pointer',

        '&:active': {
          background: theme.palette.slider.trackActive
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

export default (withStyles(styles)(connect(null, mapDispatchToProps)(MidiSliderHorz)))