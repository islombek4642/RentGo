import * as React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../constants/theme';

interface LoaderProps {
  visible?: boolean;
  overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible = true, overlay = false }) => {
  if (!visible) return null;

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default Loader;
