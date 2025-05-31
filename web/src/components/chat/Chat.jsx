import { useState, useContext, useEffect, useRef } from 'react';
import './chat.scss';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../lib/apiRequest';
import { format } from 'timeago.js';
import { SocketContext } from '../../context/SocketContext';
import { useNotificationStore } from '../../lib/notificationStore';

function Chat({ chats, updateChats }) {
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { decrease: decreaseNotifications, fetch: fetchNotifications } =
    useNotificationStore();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Register user with socket when component mounts
  useEffect(() => {
    if (socket?.connected && currentUser) {
      socket.emit('newUser', currentUser.id);
    }
  }, [socket?.connected, currentUser]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleGetMessage = data => {
      setChat(prev => {
        // Only update if this message belongs to the current open chat
        if (prev && prev.id === data.chatId) {
          // Mark chat as read when receiving a message
          markChatAsRead(prev.id);

          return {
            ...prev,
            messages: [...prev.messages, data],
          };
        }
        return prev;
      });

      // Update chats list to show new last message
      if (updateChats) {
        updateChats(prevChats =>
          prevChats.map(c =>
            c.id === data.chatId
              ? { ...c, lastMessage: data.text, seenBy: [] } // Reset seenBy for new message
              : c
          )
        );
      }

      // Refresh notifications count
      fetchNotifications();
    };

    socket.on('getMessage', handleGetMessage);

    return () => {
      socket.off('getMessage', handleGetMessage);
    };
  }, [socket, updateChats, fetchNotifications]);

  const markChatAsRead = async chatId => {
    try {
      await apiRequest.put(`/chat/read/${chatId}`);

      // Update local chats state to reflect read status
      if (updateChats) {
        updateChats(prevChats =>
          prevChats.map(c =>
            c.id === chatId
              ? { ...c, seenBy: [...c.seenBy, currentUser.id] }
              : c
          )
        );
      }

      // Decrease notification count
      decreaseNotifications();
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const handleOpenChat = async (id, receiver) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await apiRequest(`/chat/${id}`);
      console.log('chat response', response.data.data);
      setChat({ ...response.data.data, receiver });

      // Check if chat is unread before marking as read
      const currentChat = chats?.find(c => c.id === id);
      const isUnread =
        currentChat && !currentChat.seenBy.includes(currentUser.id);

      if (isUnread) {
        await markChatAsRead(id);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      setError('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const text = formData.get('text');

    if (!text || !text.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest.post(`/message/${chat.id}`, {
        text: text.trim(),
      });

      const newMessage = response.data.data;

      setChat(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // Update chats list with new last message
      if (updateChats) {
        updateChats(prevChats =>
          prevChats.map(c =>
            c.id === chat.id
              ? { ...c, lastMessage: text.trim(), seenBy: [currentUser.id] }
              : c
          )
        );
      }

      if (socket?.connected) {
        socket.emit('sendMessage', {
          receiverId: chat.receiver.id,
          data: {
            ...newMessage,
            chatId: chat.id,
          },
        });
      }

      e.target.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='chat'>
      <div className='messages'>
        <h1>Messages</h1>
        {chats?.map(c => (
          <div
            className='message'
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? 'white'
                  : '#fecd514e',
            }}
            onClick={() => {
              handleOpenChat(c.id, c.receiver);
            }}
          >
            <img src={c.receiver?.avatar || './noavatar.jpg'} alt='' />
            <span>{c.receiver?.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className='chatBox'>
          <div className='top'>
            <div className='user'>
              <img src={chat.receiver?.avatar || './noavatar.jpg'} alt='' />
              {chat.receiver?.username}
            </div>
            <span className='close' onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className='center'>
            {chat.messages?.map(message => (
              <div
                className={
                  message.userId === currentUser.id
                    ? 'chatMessage own'
                    : 'chatMessage'
                }
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className='bottom'>
            <textarea
              name='text'
              placeholder='Type a message...'
              disabled={isLoading}
            />
            <button type='submit' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
          {error && <div className='error'>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default Chat;
