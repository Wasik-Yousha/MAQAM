import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, useColorScheme, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/stores/appStore';
import { Feather } from '@expo/vector-icons';
import { sendPersonalAssistantMessage } from '@/services/groq';
import { useRouter } from 'expo-router';

export default function CompanionScreen() {
  const { personalAssistantMessages, addPersonalAssistantMessage, theme, user } = useAppStore();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const activeTheme = theme === 'system' ? systemColorScheme : theme;
  const colors = Colors[activeTheme];

  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const [suggestedActions, setSuggestedActions] = useState<any[]>([]);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageContent = input.trim();
    setInput('');

    addPersonalAssistantMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
    });

    const messagesToSend = [...personalAssistantMessages, { id: 'temp', role: 'user', content: userMessageContent }].map((m) => ({
      role: m.role === 'companion' ? 'assistant' : 'user',
      content: m.content,
    }));

    setSuggestedActions([]);
    const response = await sendPersonalAssistantMessage(messagesToSend);

    if (response && response.text) {
      addPersonalAssistantMessage({
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
    if (action === 'open_reader') {
      router.push('/(tabs)/read');
    } else if (action === 'open_halaka') {
      router.push('/(tabs)/halaka');
    } else if (action === 'open_barakah') {
      router.push('/(tabs)/barakah');
    } else if (action === 'custom' && payload) {
      setInput(payload);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={styles.messages} 
        contentContainerStyle={styles.messagesContent}
      >
        {personalAssistantMessages.map(msg => (
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
          placeholder="Ask anything about the Quran..."
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
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  messageBubble: {
    maxWidth: '85%',
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
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.primaryForeground,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
