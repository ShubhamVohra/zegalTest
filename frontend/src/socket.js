import React from "react";
import socketIOClient from "socket.io-client";

//link should be in environment file!
let socket = socketIOClient("http://localhost:3001");

//component wrapper that allows us to use socket globally
function withSocket(WrappedComponent) {
  const WithSocket = (props) => {
    //function to subscribe to events
    const socketListen = async (queue, callback) => {
      socket.on(queue, (data) => {
        callback(data);
      });
    };

    const socketSend = async (queue, data) => {
      console.log(queue);
      socket.emit(queue, JSON.stringify(data));
    };

    return (
      <WrappedComponent
        {...props}
        socketSend={socketSend}
        socketListen={socketListen}
      />
    );
  };
  return WithSocket;
}

export default withSocket;
