import { useState } from 'react';
import './chat.scss';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../lib/apiRequest';
import { format } from 'timeago.js';

function Chat({ chats }) {
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useContext(AuthContext);

  const handleOpenChat = async (id, receiver) => {
    try {
      setIsLoading(true);
      const response = await apiRequest(`/chat/${id}`); // Added missing slash
      console.log('chat response', response.data.data);
      setChat({ ...response.data.data, receiver });
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

      setChat(prev => ({
        ...prev,
        messages: [...prev.messages, response.data.data], // Added .data based on your API response structure
      }));

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
              backgroundColor: c.seenBy.includes(currentUser.id)
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
          </div>
          <form onSubmit={handleSendMessage} className='bottom'>
            {' '}
            {/* Changed onClick to onSubmit */}
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
