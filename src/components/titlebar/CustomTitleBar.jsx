import React from 'react';
import './CustomTitleBar.scss';

const CustomTitleBar = ({ icon, app, theme = {} }) => {
  const handleMinimize = () => {
    if (window?.electron?.windowControls) {
      window.electron.windowControls('minimize');
    }
  };

  const handleMaximize = () => {
    if (window?.electron?.windowControls) {
      window.electron.windowControls('maximize');
    }
  };

  const handleClose = () => {
    if (window?.electron?.windowControls) {
      window.electron.windowControls('close');
    }
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
