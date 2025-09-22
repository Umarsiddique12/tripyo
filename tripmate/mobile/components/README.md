# Components Directory

This directory is intended for reusable UI components that can be shared across multiple screens.

## Planned Components

The following components could be created to improve code reusability:

### Form Components
- `CustomInput.js` - Reusable input component with validation
- `CustomButton.js` - Reusable button component with loading states
- `CustomModal.js` - Reusable modal component

### UI Components
- `LoadingSpinner.js` - Loading indicator component
- `EmptyState.js` - Empty state component for lists
- `ErrorBoundary.js` - Error boundary component
- `Toast.js` - Custom toast component wrapper

### Trip Components
- `TripCard.js` - Reusable trip card component
- `MemberAvatar.js` - User avatar component
- `ExpenseItem.js` - Expense list item component
- `MessageBubble.js` - Chat message component

### Navigation Components
- `TabBarIcon.js` - Custom tab bar icon component
- `HeaderButton.js` - Header action button component

## Current Implementation

Currently, the app uses inline components within screens. As the app grows, these components should be extracted into this directory for better maintainability and reusability.

## Usage

When creating new components:

1. Place them in this directory
2. Export them as default exports
3. Import them in screens as needed
4. Follow React Native best practices
5. Include proper TypeScript types if using TypeScript

## Example Component Structure

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomComponent = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // styles here
  },
  title: {
    // styles here
  },
});

export default CustomComponent;
```
