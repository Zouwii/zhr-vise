import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useState } from 'react'
import { colors } from '../../src/lib/theme'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8787/api')

  const handleSave = async () => {
    await AsyncStorage.setItem('api_url', apiUrl)
    Alert.alert('已保存', 'API 地址已更新（需要重启应用生效）')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服务器</Text>
        <Text style={styles.label}>API 地址</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholderTextColor={colors.textDim}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存设置</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <Text style={styles.aboutText}>ViseFit v1.0.0</Text>
        <Text style={styles.aboutSub}>健身日历 · 训练追踪 · 备忘录</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  section: {
    marginHorizontal: 16, marginTop: 20, padding: 16,
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { color: colors.textDim, fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  label: { color: colors.text, fontSize: 14, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: colors.border, fontFamily: 'monospace',
  },
  saveBtn: {
    marginTop: 12, backgroundColor: colors.primary, paddingVertical: 12,
    borderRadius: 10, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  aboutText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  aboutSub: { color: colors.textDim, fontSize: 13, marginTop: 4 },
})
