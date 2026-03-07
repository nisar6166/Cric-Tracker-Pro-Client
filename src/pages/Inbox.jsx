import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/contact/all');
                setMessages(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching messages", err);
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    // logic for delete
    const handleDeleteMessage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        
        try {
            await axios.delete(`http://localhost:5000/api/contact/delete/${id}`);
            setMessages(messages.filter(msg => msg._id !== id));
            alert("Message deleted successfully! 🗑️");
        } catch (err) {
            alert("Failed to delete the message.");
        }
    };

    if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading Messages...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
                    📩 Admin Inbox
                </h2>

                {messages.length === 0 ? (
                    <div className="bg-white p-8 text-center rounded-xl shadow-sm text-gray-500 font-bold">
                        No new messages. Your inbox is clean! ✨
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <div key={msg._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">{msg.name}</h4>
                                        <p className="text-sm text-blue-600 font-medium">{msg.email}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 font-semibold">
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 mt-3 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                                    {msg.message}
                                </p>
                                <div className="mt-4 text-right">
                                    <button 
                                        onClick={() => handleDeleteMessage(msg._id)} 
                                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-4 rounded-lg text-xs transition border border-red-200"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;