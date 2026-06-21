import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import GlowBackground from './GlowBackground';
import CoinAvatar from './CoinAvatar';
import { askExpert } from '../services/anthropic';

const SUGGESTIONS = ['Is this coin rare?', "What's it worth?", 'How should I store it?', 'How can I spot a fake?'];

function friendlyError(e) {
  if (e?.code === 'NO_API_KEY') return 'Add your Anthropic API key in .env to chat with the expert.';
  return "Sorry — I couldn't reach the archives just now. Please try again.";
}

export default function ExpertChat({ coin, onClose }) {
  const [messages, setMessages] = useState([]); // real user/assistant turns only
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  if (!coin) return null;

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setSending(true);
    scrollDown();
    try {
      const reply = await askExpert(coin, next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: friendlyError(e) }]);
    } finally {
      setSending(false);
      scrollDown();
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <GlowBackground />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={10} style={styles.headerBtn}>
                <Ionicons name="chevron-down" size={22} color={colors.muted} />
              </Pressable>
              <View style={styles.headerCenter}>
                <CoinAvatar coin={coin} size={30} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.headerName} numberOfLines={1}>
                    {coin.name}
                  </Text>
                  <Text style={styles.headerSub}>Numismatic expert</Text>
                </View>
              </View>
              <View style={styles.headerBtn} />
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={styles.messages}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Bubble role="assistant" text={`Ask me anything about your ${coin.name}.`} />
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.content} />
              ))}
              {sending && (
                <View style={[styles.bubble, styles.assistant]}>
                  <ActivityIndicator color={colors.gold} size="small" />
                </View>
              )}

              {messages.length === 0 && !sending && (
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable key={s} style={styles.suggestChip} onPress={() => send(s)}>
                      <Text style={styles.suggestText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputBar}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about this coin…"
                placeholderTextColor={colors.faint}
                style={styles.input}
                multiline
                onSubmitEditing={() => send()}
                returnKeyType="send"
              />
              <Pressable
                onPress={() => send()}
                disabled={sending || !input.trim()}
                style={[styles.sendBtn, (sending || !input.trim()) && { opacity: 0.4 }]}
              >
                <Ionicons name="arrow-up" size={20} color={colors.black} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const Bubble = ({ role, text }) => {
  const isUser = role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
      <Text style={[styles.bubbleText, isUser && { color: colors.black }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorderSoft,
  },
  headerBtn: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ivory, maxWidth: 180 },
  headerSub: { fontFamily: fonts.body, fontSize: 11.5, color: colors.gold, marginTop: 1 },

  messages: { padding: 18, paddingBottom: 8 },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  assistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.glassRaised,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderBottomLeftRadius: 6,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: colors.gold,
    borderBottomRightRadius: 6,
  },
  bubbleText: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.text },

  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 6 },
  suggestChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  suggestText: { fontFamily: fonts.bodyMed, fontSize: 13, color: colors.gold },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorderSoft,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: colors.ivory,
    fontFamily: fonts.body,
    fontSize: 14.5,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
