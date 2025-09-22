import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const GradientButton = ({ title, onPress, disabled, style, leftIcon, rightIcon }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled} style={style}>
      <LinearGradient
        colors={[colors.primary, '#9F67FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, disabled && { opacity: 0.7 }]}
      >
        {leftIcon}
        <Text style={styles.title}>{title}</Text>
        {rightIcon}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default GradientButton;
