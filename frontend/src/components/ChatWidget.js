import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChatContacts, getConversation, sendChatMessage } from '../services/shop';
import './chat-widget.css';

const getContactName = (contact) =>
    contact?.shopName || [contact?.lastName, contact?.firstName].filter(Boolean).join(' ') || contact?.email || 'Người dùng';

function ChatWidget() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const panelRef = useRef(null);
    const messagesEndRef = useRef(null);

    const selectedContactId = selectedContact?.id;

    const sortedContacts = useMemo(
        () => [...contacts].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
        [contacts]
    );

    const totalUnreadCount = useMemo(
        () => contacts.reduce((sum, contact) => sum + Number(contact.unreadCount || 0), 0),
        [contacts]
    );

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const handleOpenChat = (event) => {
            const contact = event.detail;
            if (!contact?.id || String(contact.id) === String(user.id)) return;

            setContacts((prev) => {
                const exists = prev.some((item) => String(item.id) === String(contact.id));
                if (exists) {
                    return prev.map((item) => (
                        String(item.id) === String(contact.id) ? { ...item, ...contact } : item
                    ));
                }
                return [{ ...contact, lastMessageAt: new Date().toISOString() }, ...prev];
            });
            setSelectedContact(contact);
            setIsOpen(true);
        };

        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const fetchContacts = async () => {
            try {
                setLoadingContacts(true);
                const response = await getChatContacts();
                const nextContacts = response.data || [];
                setContacts(nextContacts);
                if (selectedContactId) {
                    const refreshedSelected = nextContacts.find((item) => String(item.id) === String(selectedContactId));
                    if (refreshedSelected) {
                        setSelectedContact((prev) => ({ ...prev, ...refreshedSelected }));
                    }
                }
            } finally {
                setLoadingContacts(false);
            }
        };

        fetchContacts();
        const intervalId = window.setInterval(fetchContacts, 15000);

        return () => window.clearInterval(intervalId);
    }, [isAuthenticated, user, selectedContactId]);

    useEffect(() => {
        if (!selectedContactId || !isAuthenticated || !user) return;

        const fetchMessages = async () => {
            try {
                setLoadingMessages(true);
                const response = await getConversation(selectedContactId);
                setMessages(response.data || []);
                setContacts((prev) => prev.map((contact) => (
                    String(contact.id) === String(selectedContactId)
                        ? { ...contact, unreadCount: 0 }
                        : contact
                )));
                setSelectedContact((prev) => (prev ? { ...prev, unreadCount: 0 } : prev));
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
        const intervalId = window.setInterval(fetchMessages, 5000);

        return () => window.clearInterval(intervalId);
    }, [selectedContactId, isAuthenticated, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        setIsOpen(true);
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!selectedContact || !messageText.trim()) return;

        try {
            setSending(true);
            const response = await sendChatMessage({
                receiverId: selectedContact.id,
                content: messageText.trim()
            });
            const newMessage = response.data;
            setMessages((prev) => [...prev, newMessage]);
            setContacts((prev) => {
                const nextContact = {
                    ...selectedContact,
                    lastMessage: newMessage.content,
                    lastMessageAt: newMessage.createdAt || new Date().toISOString(),
                    unreadCount: 0
                };
                const others = prev.filter((item) => String(item.id) !== String(selectedContact.id));
                return [nextContact, ...others];
            });
            setMessageText('');
        } finally {
            setSending(false);
        }
    };

    const handleMessageKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sending && messageText.trim()) {
                handleSendMessage();
            }
        }
    };

    return (
        <div className="chat-widget-root">
            {!isOpen && (
                <button className="chat-widget-toggle" type="button" onClick={() => setIsOpen(true)}>
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>Chat</span>
                    {totalUnreadCount > 0 && <span className="chat-widget-badge">{totalUnreadCount}</span>}
                </button>
            )}

            {isOpen && (
                <div className="chat-widget-panel" ref={panelRef}>
                    <div className="chat-widget-header">
                        <div>
                            <div className="chat-widget-title">Trò chuyện</div>
                            <div className="chat-widget-subtitle">
                                {selectedContact ? getContactName(selectedContact) : 'Chọn một cuộc trò chuyện'}
                            </div>
                        </div>
                        <button type="button" className="chat-widget-close" onClick={() => setIsOpen(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div className="chat-widget-body">
                        <div className="chat-widget-sidebar">
                            <div className="chat-widget-sidebar-title">Liên hệ</div>
                            {loadingContacts ? (
                                <div className="chat-widget-empty">Đang tải...</div>
                            ) : sortedContacts.length === 0 ? (
                                <div className="chat-widget-empty">
                                    Chưa có hội thoại. Bạn có thể vào trang sản phẩm và bấm "Chat với shop".
                                </div>
                            ) : (
                                <div className="chat-widget-contact-list">
                                    {sortedContacts.map((contact) => (
                                        <button
                                            key={contact.id}
                                            type="button"
                                            className={`chat-widget-contact ${String(selectedContactId) === String(contact.id) ? 'active' : ''}`}
                                            onClick={() => handleSelectContact(contact)}
                                        >
                                            <div className="chat-widget-contact-row">
                                                <div className="chat-widget-contact-name">{getContactName(contact)}</div>
                                                {Number(contact.unreadCount || 0) > 0 && (
                                                    <span className="chat-widget-contact-badge">{contact.unreadCount}</span>
                                                )}
                                            </div>
                                            <div className="chat-widget-contact-meta">{contact.lastMessage || 'Bắt đầu trò chuyện'}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="chat-widget-content">
                            {!selectedContact ? (
                                <div className="chat-widget-empty large">Chọn shop hoặc người mua để bắt đầu trò chuyện.</div>
                            ) : (
                                <>
                                    <div className="chat-widget-messages">
                                        {loadingMessages ? (
                                            <div className="chat-widget-empty">Đang tải tin nhắn...</div>
                                        ) : messages.length === 0 ? (
                                            <div className="chat-widget-empty">Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên.</div>
                                        ) : (
                                            messages.map((message) => {
                                                const isMine = String(message.senderId) === String(user.id);
                                                return (
                                                    <div key={message.id} className={`chat-widget-message ${isMine ? 'mine' : 'theirs'}`}>
                                                        <div className="chat-widget-message-bubble">{message.content}</div>
                                                        <div className="chat-widget-message-time">
                                                            {new Date(message.createdAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef}></div>
                                    </div>

                                    <form className="chat-widget-form" onSubmit={handleSendMessage}>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            placeholder="Nhập tin nhắn... Enter để gửi, Shift+Enter để xuống dòng"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyDown={handleMessageKeyDown}
                                        />
                                        <button className="btn btn-primary" type="submit" disabled={sending || !messageText.trim()}>
                                            {sending ? 'Đang gửi...' : 'Gửi'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatWidget;
