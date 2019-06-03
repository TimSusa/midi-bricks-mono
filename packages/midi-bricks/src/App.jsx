import { Drawer } from '@material-ui/core'
import React, { useState } from 'react'
import Home from './pages/Home'

import MenuAppBar from './components/menu-app-bar/MenuAppBar'
import DrawerList from './components/drawer-list/DrawerList'
import Footer from './components/footer/Footer'
import { makeStyles } from '@material-ui/styles'

export default App

function App() {
  const classes = makeStyles(styles, { withTheme: true })()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className={classes.root}>
      <div className={classes.appBar}>
        <MenuAppBar handleDrawerToggle={() => setIsMobileOpen(!isMobileOpen)} />
        <Drawer
          variant='temporary'
          anchor={'left'}
          open={isMobileOpen}
          classes={{
            paper: classes.drawerPaper
          }}
          onClose={() => setIsMobileOpen(!isMobileOpen)}
        >
          <DrawerList
            onFileChange={() => setIsMobileOpen(false)}
            handleSaveFile={() => setIsMobileOpen(false)}
            handleResetSliders={() => setIsMobileOpen(false)}
            classes={classes}
            onClose={() => setIsMobileOpen(!isMobileOpen)}
          />
        </Drawer>
        <Home />

        <Footer />
      </div>
    </div>
  )
}

function styles(theme) {
  return {
    root: {
      width: '100%',
      height: '100%',
      zIndex: 1
    },
    appFrame: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      height: '100%'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      position: 'absolute',
      right: 0,
      left: 0,
      margin: 0
    },
    navIconHide: {},
    drawerHeader: {
      ...theme.mixins.toolbar
    },
    drawerPaper: {
      width: 250,
      backgroundColor: 'white'
    },
    content: {
      backgroundColor: theme.palette.background.default,
      width: '100%',
      marginTop: theme.spacing(1)
    }
  }
}
