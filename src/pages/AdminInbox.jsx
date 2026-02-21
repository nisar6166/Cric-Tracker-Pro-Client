import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/contact/all');
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching messages", err);
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-3 flex flex-col gap-3 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full rounded-t-lg shadow-md">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 Admin Inbox</Link>
        </div>
        <Link to="/" className="bg-white text-blue-900 px-5 py-2 rounded-full font-bold shadow-sm">Back to Home</Link>
      </nav>

      {/* Messages List */}
      <main className="bg-white flex-1 p-6 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 border-b pb-2">User Messages</h2>

        {loading ? (
          <p className="text-center py-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No messages found in the inbox.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 text-blue-900 border-b">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-bold">{msg.name}</td>
                    <td className="p-4 text-blue-600">{msg.email}</td>
                    <td className="p-4 font-medium">{msg.subject}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{msg.message}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminInbox;