import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Set the initial welcome message when the chatbot is opened
    useEffect(() => {
        if (isOpen) {
            setMessages([
                { sender: 'bot', text: "Hello! I'm your order tracking assistant. Please provide your Order ID (e.g., ORD17...) to get a status update." }
            ]);
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await api.post('/orders/track', { orderId: userMessage });
            setMessages(prev => [...prev, { sender: 'bot', text: response.data.message }]);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    // The chatbot will only be rendered if the user is authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>Order Tracking</h3>
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="message bot typing-indicator"><span></span><span></span><span></span></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter your Order ID..."
                            disabled={isLoading}
                            autoFocus
                        />
                        <button type="submit" disabled={isLoading || !inputValue}>Send</button>
                    </form>
                </div>
            )}
            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} title="Track Your Order">
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default Chatbot;