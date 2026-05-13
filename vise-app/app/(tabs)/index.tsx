import { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, StyleSheet,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { colors } from '../../src/lib/theme'
import { getMonthData, addWorkout, updateWorkout, removeWorkout, type Workout } from '../../src/lib/store'

const DAYS = ['日', '一', '二', '三', '四', '五', '六']
const CATEGORIES: { key: Workout['category']; label: string; color: string }[] = [
  { key: 'strength', label: '力量', color: '#f87171' },
  { key: 'cardio', label: '有氧', color: '#60a5fa' },
  { key: 'yoga', label: '瑜伽', color: '#34d399' },
  { key: 'other', label: '其他', color: '#a78bfa' },
]

export default function CalendarScreen() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )
  const [daysData, setDaysData] = useState<Record<string, { workouts: Workout[]; memos: any[] }>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'other' as Workout['category'], durationMinutes: '60' })

  const ym = `${year}-${String(month).padStart(2, '0')}`

  useFocusEffect(
    useCallback(() => { getMonthData(ym).then(setDaysData) }, [ym])
  )

  const changeMonth = (d: number) => {
    let m = month + d, y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setMonth(m); setYear(y)
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const dateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const dayEntries = daysData[selectedDate]

  const handleAdd = async () => {
    if (!form.title.trim()) return
    await addWorkout({
      title: form.title.trim(),
      date: selectedDate,
      category: form.category,
      durationMinutes: parseInt(form.durationMinutes) || 60,
    })
    setShowAdd(false)
    setForm({ title: '', category: 'other', durationMinutes: '60' })
    setDaysData(await getMonthData(ym))
  }

  const toggleComplete = async (w: Workout) => {
    await updateWorkout(w.id, { completed: !w.completed })
    setDaysData(await getMonthData(ym))
  }

  const handleDelete = (w: Workout) => {
    Alert.alert('删除', `确定删除「${w.title}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        await removeWorkout(w.id)
        setDaysData(await getMonthData(ym))
      }},
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{year}年{month}月</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dowRow}>
        {DAYS.map(d => <Text key={d} style={styles.dowText}>{d}</Text>)}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`e${i}`} style={styles.cell} />
          const ds = dateStr(day)
          const has = daysData[ds]
          const sel = ds === selectedDate
          const isT = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
          return (
            <TouchableOpacity key={ds} style={[styles.cell, sel && styles.cellSel]} onPress={() => setSelectedDate(ds)}>
              <Text style={[styles.cellText, isT && styles.cellToday, sel && styles.cellTextSel]}>{day}</Text>
              {has && <View style={styles.dot} />}
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.bar}>
        <Text style={styles.barDate}>{selectedDate}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ 训练</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {dayEntries?.workouts?.map(w => (
          <TouchableOpacity key={w.id} style={[styles.card, w.completed && styles.cardDone]}
            onPress={() => toggleComplete(w)} onLongPress={() => handleDelete(w)}>
            <View style={styles.cardLeft}>
              <View style={[styles.catBadge, { backgroundColor: CATEGORIES.find(c => c.key === w.category)?.color }]}>
                <Text style={styles.catText}>{CATEGORIES.find(c => c.key === w.category)?.label}</Text>
              </View>
              <Text style={[styles.cardTitle, w.completed && styles.cardTitleDone]}>{w.title}</Text>
            </View>
            <View style={styles.cardRight}>
              {w.startTime ? <Text style={styles.cardTime}>{w.startTime}</Text> : null}
              <Text style={styles.cardDur}>{w.durationMinutes}分钟</Text>
              {w.completed ? <Text style={styles.check}>✓</Text> : <View style={styles.circle} />}
            </View>
          </TouchableOpacity>
        ))}
        {dayEntries?.memos?.map(m => (
          <View key={m.id} style={styles.memoCard}>
            <Text style={styles.memoIcon}>📝</Text>
            <View>
              <Text style={styles.memoTitle}>{m.title}</Text>
              <Text style={styles.memoTag}>{m.tag === 'nutrition' ? '饮食' : m.tag === 'goal' ? '目标' : m.tag === 'injury' ? '伤病' : '一般'}</Text>
            </View>
          </View>
        ))}
        {(!dayEntries || (!dayEntries.workouts?.length && !dayEntries.memos?.length)) && (
          <Text style={styles.empty}>这天还没有记录</Text>
        )}
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>添加训练 - {selectedDate}</Text>
            <TextInput style={styles.input} placeholder="训练名称" placeholderTextColor={colors.textDim}
              value={form.title} onChangeText={t => setForm({ ...form, title: t })} />
            <View style={styles.catRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.key}
                  style={[styles.catBtn, form.category === cat.key && { backgroundColor: cat.color }]}
                  onPress={() => setForm({ ...form, category: cat.key })}>
                  <Text style={styles.catBtnText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="时长（分钟）" placeholderTextColor={colors.textDim}
              keyboardType="numeric" value={form.durationMinutes}
              onChangeText={t => setForm({ ...form, durationMinutes: t })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
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
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  navArrow: { fontSize: 28, color: colors.primary, paddingHorizontal: 8 },
  monthTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  dowRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
  dowText: { flex: 1, textAlign: 'center', color: colors.textDim, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  cellSel: { backgroundColor: colors.primary },
  cellText: { color: colors.text, fontSize: 15 },
  cellTextSel: { color: '#fff', fontWeight: '700' },
  cellToday: { color: colors.accent, fontWeight: '700' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 2 },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  barDate: { fontSize: 16, fontWeight: '600', color: colors.text },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { flex: 1, paddingHorizontal: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  cardDone: { opacity: 0.5, borderColor: colors.accentDim },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardTitleDone: { textDecorationLine: 'line-through', color: colors.textDim },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTime: { color: colors.textDim, fontSize: 13 },
  cardDur: { color: colors.textDim, fontSize: 13 },
  check: { color: colors.accent, fontSize: 20, fontWeight: '700' },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  memoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 12, marginBottom: 8, gap: 10 },
  memoIcon: { fontSize: 18 },
  memoTitle: { color: colors.text, fontSize: 14, fontWeight: '500' },
  memoTag: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textDim, textAlign: 'center', marginTop: 40, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.surface, padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  input: { backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  catRow: { flexDirection: 'row', gap: 8 },
  catBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  catBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: colors.surfaceLight },
  cancelBtnText: { color: colors.textDim, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: colors.primary },
  saveBtnText: { color: '#fff', fontWeight: '700' },
})
