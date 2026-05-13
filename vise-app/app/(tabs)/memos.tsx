import { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert, StyleSheet } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { colors } from '../../src/lib/theme'
import { getMemos, addMemo, removeMemo, type Memo } from '../../src/lib/store'

const TAGS: { key: Memo['tag']; label: string; color: string }[] = [
  { key: 'general', label: '📋 一般', color: '#a78bfa' },
  { key: 'nutrition', label: '🍎 饮食', color: '#fbbf24' },
  { key: 'goal', label: '🎯 目标', color: '#60a5fa' },
  { key: 'injury', label: '🏥 伤病', color: '#f87171' },
]

export default function MemosScreen() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [selectedTag, setSelectedTag] = useState<Memo['tag'] | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', tag: 'general' as Memo['tag'] })

  useFocusEffect(
    useCallback(() => { getMemos(selectedTag ?? undefined).then(setMemos) }, [selectedTag])
  )

  const handleSave = async () => {
    if (!form.title.trim()) return
    await addMemo({ title: form.title.trim(), content: form.content.trim(), date: new Date().toISOString().slice(0, 10), tag: form.tag })
    setShowAdd(false)
    setForm({ title: '', content: '', tag: 'general' })
    setMemos(await getMemos(selectedTag ?? undefined))
  }

  const handleDelete = (id: string) => {
    Alert.alert('删除', '确定删除这条备忘录？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        await removeMemo(id)
        setMemos(await getMemos(selectedTag ?? undefined))
      }},
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>备忘录</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ 新建</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagRow}>
        {TAGS.map(t => (
          <TouchableOpacity key={t.key}
            style={[styles.tag, selectedTag === t.key && { backgroundColor: t.color + '30', borderColor: t.color }]}
            onPress={() => setSelectedTag(selectedTag === t.key ? null : t.key)}>
            <Text style={[styles.tagText, selectedTag === t.key && { color: t.color }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={memos}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const tag = TAGS.find(t => t.key === item.tag)
          return (
            <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id)}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTag}>{tag?.label}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.content ? <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text> : null}
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={<Text style={styles.empty}>还没有备忘录</Text>}
      />

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>新建备忘录</Text>
            <TextInput style={styles.input} placeholder="标题" placeholderTextColor={colors.textDim}
              value={form.title} onChangeText={t => setForm({ ...form, title: t })} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="内容（选填）" placeholderTextColor={colors.textDim}
              multiline numberOfLines={4} value={form.content} onChangeText={t => setForm({ ...form, content: t })} />
            <View style={styles.tagRow}>
              {TAGS.map(t => (
                <TouchableOpacity key={t.key}
                  style={[styles.tag, form.tag === t.key && { backgroundColor: t.color + '30', borderColor: t.color }]}
                  onPress={() => setForm({ ...form, tag: t.key })}>
                  <Text style={[styles.tagText, form.tag === t.key && { color: t.color }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginBottom: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tagText: { color: colors.textDim, fontSize: 13, fontWeight: '500' },
  card: { backgroundColor: colors.surface, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTag: { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },
  cardDate: { color: colors.textDim, fontSize: 12 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardContent: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 60, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  input: { backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: colors.surfaceLight },
  cancelBtnText: { color: colors.textDim, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: colors.primary },
  saveBtnText: { color: '#fff', fontWeight: '700' },
})
