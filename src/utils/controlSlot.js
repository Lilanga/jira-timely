import React, { useState, useEffect } from 'react';

// Simple slot replacement for react-tackle-box
const ControlSlot = {
  Entry: ({ children, waitForOutlet }) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      if (waitForOutlet) {
        setMounted(true);
      }
    }, [waitForOutlet]);
    
    if (waitForOutlet && !mounted) {
      return null;
    }
    
    return <div className="control-slot-entry">{children}</div>;
  },
  
  Outlet: ({ children }) => {
    return <div className="control-slot-outlet">{children}</div>;
  }
};

export default ControlSlot;