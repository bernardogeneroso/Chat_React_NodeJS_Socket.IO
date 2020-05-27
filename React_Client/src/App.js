import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://192.168.1.72:4001";

const socket = socketIOClient(ENDPOINT);

function App() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    document.getElementById("inputMessage").focus();
    socket.on("newMessage", (data) => {
      setMessages([...messages, data]);
    });
  }, [messages]);

  useEffect(() => {
    let usernameTake = localStorage.getItem("username")
      ? localStorage.getItem("username")
      : window.prompt("Username:");
    if (usernameTake === null || usernameTake === "")
      usernameTake = "Anonymous";
    setUsername(usernameTake);
    localStorage.setItem("username", usernameTake);
    socket.on("messagesStart", (data) => {
      if (data) {
        setMessages(data);
      }
    });
    socket.on("messagesRender", (data) => {
      setMessages(data);
    });
  }, []);

  function sendMessage() {
    if (inputText !== "") {
      setMessages([
        ...messages,
        {
          key: Date.now(),
          username,
          text: inputText,
        },
      ]);
      setInputText("");
      socket.emit("messageToServer", {
        key: Date.now(),
        username,
        text: inputText,
      });
    }
    document.getElementById("inputMessage").focus();
  }

  function enterSend(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  function removeMessage(data) {
    const key = data.key;
    const usernameTake = data.username;
    if (username === usernameTake) {
      let messageRemove = messages.filter((item) => item.key !== key);
      setMessages(messageRemove);
      socket.emit("removeMessage", messageRemove);
    }
  }

  function changeUsername() {
    const messagesUserRemove = messages.filter(
      (item) => item.username !== username
    );

    setMessages(messagesUserRemove);
    socket.emit("removeMessage", messagesUserRemove);

    let usernameTake = window.prompt("Username:");
    if (usernameTake === null || usernameTake === "")
      usernameTake = "Anonymous";
    setUsername(usernameTake);
    localStorage.setItem("username", usernameTake);
  }

  return (
    <div className="content">
      <div className="contentText">
        <div className="contentTextAlign">
          {messages.map((item) => (
            <div
              className={
                item.username === username ? "leftAlign" : "rightAlign"
              }
              key={item.key}
              onClick={() => removeMessage(item)}
            >
              <div
                className={
                  "speech-bubble-" +
                  (item.username === username ? "left" : "right")
                }
              >
                <div>{item.text}</div>
                <div className="username">{item.username}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="contentAlignDown">
          <Button className="btn-lg" variant="dark" onClick={changeUsername}>
            Change username
          </Button>
          <Form.Control
            type="text"
            placeholder="Message..."
            className="contentTextAlign   bg-dark text-white input-lg"
            id="inputMessage"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyPress={(event) => enterSend(event)}
          />
          <Button className="btn-lg" variant="dark" onClick={sendMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
