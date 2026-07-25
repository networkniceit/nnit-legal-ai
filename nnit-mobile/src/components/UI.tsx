import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

// ── Gold Button ──────────────────────────────────────────────
interface GoldButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}
export const GoldButton: React.FC<GoldButtonProps> = ({
  label, onPress, loading, disabled, style, icon,
}) => (
  <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style} activeOpacity={0.85}>
    <LinearGradient
      colors={Colors.gradientGold}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.goldBtn, disabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.bg} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={styles.goldBtnText}>{label}</Text>
        </>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// ── Ghost Button ─────────────────────────────────────────────
export const GhostButton: React.FC<GoldButtonProps> = ({
  label, onPress, disabled, style, icon,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.ghostBtn, style]}
    activeOpacity={0.75}
  >
    {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
    <Text style={styles.ghostBtnText}>{label}</Text>
  </TouchableOpacity>
);

// ── Card ─────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}
export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const content = (
    <LinearGradient
      colors={Colors.gradientCard}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

// ── Section Header ───────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, right }) => (
  <View style={styles.sectionHeader}>
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {right}
  </View>
);

// ── Gold Divider ─────────────────────────────────────────────
export const GoldDivider: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

// ── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}
export const Badge: React.FC<BadgeProps> = ({ label, color = Colors.gold, style }) => (
  <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}22` }, style]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ── Empty State ───────────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
  </View>
);

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  goldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    ...Shadow.gold,
  },
  goldBtnText: {
    fontFamily: Typography.sansBold,
    fontSize: 15,
    color: Colors.bg,
    letterSpacing: 0.5,
  },
  disabled: { opacity: 0.5 },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    backgroundColor: Colors.goldMuted,
  },
  ghostBtnText: {
    fontFamily: Typography.sansMedium,
    fontSize: 15,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.serif,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontFamily: Typography.sans,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: Typography.sansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Typography.serif,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Typography.sans,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
