import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  IconButton,
  useTheme,
  Icon,
} from 'react-native-paper';
import {useTypedSelector} from '../../Store/MainStore';
import {selectUserProfile} from '../../Store/Slices/AuthSlice';
import {
  submitSupportMessage,
  subscribeSupportMessages,
} from '../../Services/Collections';

const SupportChatModal = ({visible, onDismiss}) => {
  const {colors} = useTheme();
  const user = useTypedSelector(selectUserProfile);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const unsubscribeRef = useRef(null);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 100);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Start / stop real-time subscription with modal visibility
  useEffect(() => {
    if (visible) {
      setLoading(true);
      unsubscribeRef.current = subscribeSupportMessages(msgs => {
        setMessages(msgs);
        setLoading(false);
      });
    } else {
      // Unsubscribe when modal closes
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setMessages([]);
      setLoading(false);
    }

    return () => {
      // Cleanup on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [visible]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 120);
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const newMsg = {
      text: trimmed,
      sender: 'user',
      senderName: user?.name || 'User',
      senderEmail: user?.email || '',
      createdAt: Date.now(),
    };

    setMessage('');

    try {
      // The onSnapshot subscription will reflect the new message automatically
      await submitSupportMessage(newMsg);
    } catch (e) {
      console.log('SupportChatModal ~ handleSend error:', e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatDateLabel = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Group messages by date
  const groupedMessages = () => {
    const groups = [];
    let lastDate = null;
    messages.forEach(msg => {
      const dateLabel = formatDateLabel(msg.createdAt);
      if (dateLabel !== lastDate) {
        groups.push({
          type: 'label',
          label: dateLabel,
          key: `lbl-${msg.createdAt}`,
        });
        lastDate = dateLabel;
      }
      groups.push({
        type: 'msg',
        ...msg,
        key: `msg-${msg.createdAt}-${Math.random()}`,
      });
    });
    return groups;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          {backgroundColor: colors.background},
        ]}>
        {/* Header */}
        <View
          style={[styles.header, {borderBottomColor: colors.surfaceVariant}]}>
          <View style={styles.headerLeft}>
            <View style={[styles.supportAvatar, {backgroundColor: '#6366F1'}]}>
              <Icon source="headset" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Support Chat</Text>
              <Text style={styles.headerSubtitle}>
                We typically reply in 1-2 days
              </Text>
            </View>
          </View>
          <IconButton icon="close" size={22} onPress={onDismiss} />
        </View>

        <KeyboardAvoidingView
          style={{flex: 1}}
          // behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Welcome bubble */}
            <View style={styles.welcomeWrapper}>
              <View
                style={[styles.supportBubble, {backgroundColor: '#EEF2FF'}]}>
                <Icon source="shield-account" size={16} color="#6366F1" />
                <Text style={styles.supportBubbleText}>
                  Hi {user?.name?.split(' ')[0] || 'there'}! Describe your issue
                  and our support team will get back to you shortly.
                </Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator color="#6366F1" style={{marginTop: 20}} />
            ) : (
              groupedMessages().map(item => {
                if (item.type === 'label') {
                  return (
                    <View key={item.key} style={styles.dateLabelWrapper}>
                      <View style={styles.dateLine} />
                      <Text style={styles.dateLabel}>{item.label}</Text>
                      <View style={styles.dateLine} />
                    </View>
                  );
                }

                const isUser = item.sender === 'user';
                return (
                  <View
                    key={item.key}
                    style={[
                      styles.messageRow,
                      isUser ? styles.messageRowRight : styles.messageRowLeft,
                    ]}>
                    {!isUser && (
                      <View
                        style={[
                          styles.senderDot,
                          {backgroundColor: '#6366F1'},
                        ]}>
                        <Icon source="headset" size={12} color="#fff" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isUser
                          ? [styles.bubbleUser, {backgroundColor: '#6366F1'}]
                          : [
                              styles.bubbleSupport,
                              {backgroundColor: colors.surfaceVariant},
                            ],
                      ]}>
                      <Text
                        style={[
                          styles.bubbleText,
                          {color: isUser ? '#fff' : colors.onSurface},
                        ]}>
                        {item.text}
                      </Text>
                      <Text
                        style={[
                          styles.bubbleTime,
                          {color: isUser ? 'rgba(255,255,255,0.7)' : '#94A3B8'},
                        ]}>
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                    {isUser && (
                      <View
                        style={[
                          styles.senderDot,
                          {backgroundColor: '#E0E7FF'},
                        ]}>
                        <Icon source="account" size={12} color="#6366F1" />
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputBarWrapper}>
            <View style={styles.inputPill}>
              <Icon source="message-outline" size={18} color="#94A3B8" />
              <RNTextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={500}
                style={styles.pillInput}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSend}
              />
              {message.length > 0 && (
                <Text style={styles.charCount}>{500 - message.length}</Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    message.trim() && !sending ? '#6366F1' : '#E2E8F0',
                  shadowColor: message.trim() && !sending ? '#6366F1' : 'transparent',
                },
              ]}
              onPress={handleSend}
              activeOpacity={0.75}
              disabled={!message.trim() || sending}>
              {sending ? (
                <ActivityIndicator color="#fff" size={16} />
              ) : (
                <Icon
                  source="send"
                  size={18}
                  color={message.trim() ? '#fff' : '#94A3B8'}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Android keyboard spacer */}
          {Platform.OS === 'android' && keyboardHeight > 0 && (
            <View style={{height: keyboardHeight}} />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

export default SupportChatModal;

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 0,
    marginTop: '20%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  supportAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  supportBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 12,
    maxWidth: '90%',
    gap: 8,
  },
  supportBubbleText: {
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },
  dateLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dateLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 6,
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  senderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '72%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleSupport: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: 'transparent',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 48,
  },
  pillInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1E293B',
    maxHeight: 100,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: Platform.OS === 'android' ? 8 : 0,
  },
  charCount: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    alignSelf: 'flex-end',
    paddingBottom: 4,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
