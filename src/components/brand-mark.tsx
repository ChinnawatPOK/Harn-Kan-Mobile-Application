import { StyleSheet, Text, View } from 'react-native';

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.brandRow}>
        <View style={[styles.symbol, compact && styles.symbolCompact]}>
          <Text style={[styles.symbolText, compact && styles.symbolTextCompact]}>÷</Text>
        </View>
        <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>KAN</Text>
      </View>
      <View style={[styles.poweredRow, compact && styles.poweredRowCompact]}>
        <Text style={[styles.poweredText, compact && styles.poweredTextCompact]}>
          POWERED BY
        </Text>
        <Text style={[styles.mascot, compact && styles.mascotCompact]}>🐷</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  containerCompact: {
    alignItems: 'flex-start',
    alignSelf: 'auto',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  symbol: {
    alignItems: 'center',
    backgroundColor: '#d82f78',
    borderRadius: 24,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#d82f78',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    width: 46,
  },
  symbolCompact: {
    borderRadius: 14,
    height: 27,
    width: 27,
  },
  symbolText: {
    color: '#fff',
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 32,
    marginTop: -3,
  },
  symbolTextCompact: {
    fontSize: 17,
    lineHeight: 22,
  },
  wordmark: {
    color: '#171321',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.4,
  },
  wordmarkCompact: {
    fontSize: 21,
    letterSpacing: -0.8,
  },
  poweredRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 6,
  },
  poweredRowCompact: {
    gap: 3,
    marginTop: 1,
  },
  poweredText: {
    color: '#a7a2ad',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  poweredTextCompact: {
    fontSize: 7,
    letterSpacing: 0.6,
  },
  mascot: {
    fontSize: 15,
    lineHeight: 18,
  },
  mascotCompact: {
    fontSize: 12,
    lineHeight: 14,
  },
});
