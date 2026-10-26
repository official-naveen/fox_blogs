import React, { useState } from "react";
import loadingContextAPI from "./loadingContextAPI";

const EMPTY_NOTIFICATION = { type: "info", message: "", isVisible: false };

function LoadingContext(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(EMPTY_NOTIFICATION);

  return (
    <loadingContextAPI.Provider
      value={{ isLoading, setIsLoading, notification, setNotification }}
    >
      {props.children}
    </loadingContextAPI.Provider>
  );
}

export default LoadingContext;
