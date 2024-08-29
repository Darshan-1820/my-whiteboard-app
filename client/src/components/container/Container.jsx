import React from 'react';
import Board from '../board/Board';
import './style.css';
import io from 'socket.io-client';

class Container extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            color: "#000000",
            size: "5",
            isErasing: false,
            previousColor: "#000000",
            clear: false,
            message: "",
            chat: []
        };

        // Use environment variable or fallback to localhost
        const serverUrl = process.env.REACT_APP_SERVER_URL || "https://my-whiteboard-app-server.vercel.app/";
        this.socket = io.connect(serverUrl);

        this.socket.on('chat-message', (message) => {
            this.setState({ chat: [...this.state.chat, message] });
        });

        this.socket.on('clear-board', () => {
            this.clearCanvas();
        });
    }

    changeColor(params) {
        const newColor = params.target.value;
        this.setState({
            color : newColor,
            isErasing: false,
            previousColor: newColor
        });
    }

    changeSize(params) {
        this.setState({ size : params.target.value });
    }

    toggleEraser() {
        this.setState((prevState) => {
            return prevState.isErasing
                ? { isErasing: false, color: prevState.previousColor }
                : { isErasing: true, previousColor: prevState.color, color: "#FFFFFF" };
        });
    }

    clearBoard() {
        this.socket.emit('clear-board');
        this.clearCanvas();
    }

    clearCanvas() {
        const canvas = document.querySelector('#board');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    sendMessage() {
        if (this.state.message.trim()) {
            const message = this.state.message;
            this.socket.emit('chat-message', message);

            // Update chat for the sender immediately
            this.setState((prevState) => ({
                chat: [...prevState.chat, message],
                message: "" // Clear the input after sending
            }));
        }
    }

    render() {
        return (
            <div className="container">
                <div className="drawing-area">
                <div className="tools-section">
                    <div className="color-picker-container">
                        Select a Brush Color: &nbsp;
                        <input 
                            type="color" 
                            value={this.state.isErasing ? "#FFFFFF" : this.state.color} 
                            onChange={this.changeColor.bind(this)} 
                            disabled={this.state.isErasing} 
                        />
                    </div>
                    <div className="brushsize-container">
                        Select Brush Size: &nbsp;
                        <select value={this.state.size} onChange={this.changeSize.bind(this)}>
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                            <option>20</option>
                            <option>25</option>
                            <option>30</option>
                        </select>
                    </div>
                    <div className="button-group">
                        <div className="eraser-container">
                            <button onClick={this.toggleEraser.bind(this)}>
                                {this.state.isErasing ? "Disable Eraser" : "Enable Eraser"}
                            </button>
                        </div>
                        <div className="clear-board-container">
                            <button onClick={this.clearBoard.bind(this)}>Clear Board</button>
                        </div>
                    </div>
                </div>

                <div className="board-container">
                    <Board 
                        color={this.state.color} 
                        size={this.state.size}
                        isErasing={this.state.isErasing}
                        clear={this.state.clear}
                    />
                </div>
                </div>
                <div className="myChat">
                    <div className="chat-container">
                        <div className="chat-box">
                            {this.state.chat.map((msg, index) => (
                                <div key={index} className="chat-message">
                                    {msg}
                                </div>
                            ))}
                        </div>
                        <textarea 
                            type="text" 
                            value={this.state.message} 
                            onChange={(e) => this.setState({ message: e.target.value })} 
                            onKeyPress={(e) => e.key === 'Enter' ? this.sendMessage() : null} 
                            placeholder="Type a message..." 
                        />
                        <button onClick={this.sendMessage.bind(this)}>Send</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Container;
