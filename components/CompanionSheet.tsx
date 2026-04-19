import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, useColorScheme, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { sendCompanionMessage } from '@/services/groq';
import { useRouter } from 'expo-router';

export function CompanionSheet() {
  const { companionOpen, setCompanionOpen, companionMessages, addCompanionMessage, theme, user } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const [suggestedActions, setSuggestedActions] = useState<any[]>([]);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  if (!companionOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageContent = input.trim();
    setInput('');

    addCompanionMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
    });

    const messagesToSend = [...companionMessages, { id: 'temp', role: 'user', content: userMessageContent }].map((m) => ({
      role: m.role === 'companion' ? 'assistant' : 'user',
      content: m.content,
    }));

    setSuggestedActions([]);
    const response = await sendCompanionMessage(messagesToSend);

    if (response && response.text) {
      addCompanionMessage({
        id: (Date.now() + 1).toString(),
        role: 'companion',
        content: response.text,
      });
      if (response.suggestedActions) {
        setSuggestedActions(response.suggestedActions);
      }
    }
  };

  const handleAction = (action: string, payload?: string) => {
    setCompanionOpen(false);
    if (action === 'open_reader') {
      router.push('/(tabs)/read');
    } else if (action === 'open_halaka') {
      router.push('/(tabs)/halaka');
    } else if (action === 'open_barakah') {
      router.push('/(tabs)/barakah');
    } else if (action === 'custom' && payload) {
      setInput(payload);
      setCompanionOpen(true);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={() => setCompanionOpen(false)} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.companionAvatar}>
              <Text style={styles.companionAvatarIcon}>🌙</Text>
            </View>
            <View>
              <Text style={styles.companionName}>Companion</Text>
              <Text style={styles.companionStatus}>Here to listen</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setCompanionOpen(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={styles.messages} 
          contentContainerStyle={styles.messagesContent}
        >
          {companionMessages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'companion' ? styles.companionBubble : styles.userBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.role === 'user' && styles.userMessageText,
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
          
          {suggestedActions.length > 0 && (
            <View style={styles.actionsContainer}>
              {suggestedActions.map((actionItem, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.actionBtn}
                  onPress={() => handleAction(actionItem.action, actionItem.payload)}
                >
                  <Text style={styles.actionBtnText}>{actionItem.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Share what's on your heart..."
            placeholderTextColor={colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Feather name="send" size={18} color={colors.primaryForeground} style={{ marginLeft: -2, marginTop: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companionAvatarIcon: {
    fontSize: 20,
  },
  companionName: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '700',
  },
  companionStatus: {
    color: colors.primary,
    fontSize: 12,
  },
  closeButton: {
    color: colors.mutedForeground,
    fontSize: 20,
    padding: 4,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
  },
  companionBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.primaryForeground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: colors.primaryForeground,
    fontSize: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  actionBtnText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
});
