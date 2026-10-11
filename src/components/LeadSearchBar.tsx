/**
 * LeadSearchBar + useLeadSearch — lead list screens ke liye common search
 * Local (cached) data pe filter hota hai — offline me bhi chalta hai
 */

import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const SEARCH_FIELDS = ['lead_uid', 'reg_no', 'prospect_no', 'customer_name', 'chassis_no'] as const;

// "MH-12 AB 1234" aur "mh12ab1234" dono match ho
const normalize = (value: unknown) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function useLeadSearch<T extends Record<string, any>>(leads: T[]) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return leads;
    return leads.filter(lead => SEARCH_FIELDS.some(field => normalize(lead[field]).includes(q)));
  }, [leads, query]);

  return { query, setQuery, filtered };
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function LeadSearchBar({ value, onChangeText, placeholder = 'Search Lead Id, Reg. No, Name' }: Props) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color="#666" />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="grey"
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="characters"
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10}>
          <Feather name="x-circle" size={18} color="#999" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  input: { flex: 1, paddingVertical: 10, color: '#111' },
});
