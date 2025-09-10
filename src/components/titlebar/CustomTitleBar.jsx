import React from 'react';
import './CustomTitleBar.scss';

const CustomTitleBar = ({ icon, app, theme = {} }) => {
  let ipcRenderer;
  try {
    // Fallback to ipc if no preload API is present
    // eslint-disable-next-line no-undef
    if (window && typeof window.require === 'function') {
      const electron = window.require('electron');
      ipcRenderer = electron?.ipcRenderer;
    }
  } catch (_) {}

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) return window.electronAPI.minimize();
    if (ipcRenderer) ipcRenderer.send('window-controls', 'minimize');
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) return window.electronAPI.maximize();
    if (ipcRenderer) ipcRenderer.send('window-controls', 'maximize');
  };

  const handleClose = () => {
    if (window.electronAPI?.close) return window.electronAPI.close();
    if (ipcRenderer) ipcRenderer.send('window-controls', 'close');
  };

  const titleBarStyle = {
    backgroundColor: theme.barBackgroundColor || '#2090ea',
    borderBottom: theme.barBorderBottom || '1px solid #1a70b7',
    ...theme
  };

  return (
    <div className="custom-title-bar" style={titleBarStyle}>
      <div className="title-bar-content">
        <div className="title-bar-left">
          {icon && <img src={icon} alt="App Icon" className="title-bar-icon" />}
          <span className="title-bar-title">{app}</span>
        </div>
        <div className="title-bar-controls">
          <button className="title-bar-control minimize" onClick={handleMinimize}>
            &#8211;
          </button>
          <button className="title-bar-control maximize" onClick={handleMaximize}>
            &#9633;
          </button>
          <button className="title-bar-control close" onClick={handleClose}>
            &#10005;
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTitleBar;
