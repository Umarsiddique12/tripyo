import React, { useState, useRef, useEffect } from 'react';
import { Animated, TextInput, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const FloatingLabelInput = ({ label, value, onChangeText, secureTextEntry, keyboardType, style, ...props }) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    top: animated.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }),
    fontSize: animated.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: focused ? colors.accent : colors.textSecondary,
    backgroundColor: 'transparent',
  };

  return (
    <View style={[styles.wrapper, { borderColor: focused ? colors.accent : colors.border, backgroundColor: colors.surface }, style]}>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 10,
  },
  label: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 4,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
  },
});

export default FloatingLabelInput;
