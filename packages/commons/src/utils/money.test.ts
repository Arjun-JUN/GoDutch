import {
  amountToCents,
  centsToAmount,
  formatCurrency,
  formatCurrencyWithSign,
  addMoney,
  distributeCentsEvenly,
  roundMoney,
  makeMoney,
} from './money';

describe('amountToCents', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('converts whole dollars', () => {
    expect(amountToCents(10)).toBe(1000);
  });

  it('converts dollars and cents', () => {
    expect(amountToCents(10.5)).toBe(1050);
    expect(amountToCents(10.99)).toBe(1099);
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('rounds floating-point imprecision', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(amountToCents(0.1 + 0.2)).toBe(30);
  });

  it('handles zero', () => {
    expect(amountToCents(0)).toBe(0);
  });

  it('handles large amounts', () => {
    expect(amountToCents(9999.99)).toBe(999999);
  });
});

describe('centsToAmount', () => {
  it('converts 1050 → 10.5', () => {
    expect(centsToAmount(1050)).toBe(10.5);
  });

  it('handles zero', () => {
    expect(centsToAmount(0)).toBe(0);
  });
});

describe('formatCurrency', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('formats USD with $ symbol', () => {
    expect(formatCurrency(1050, 'USD')).toBe('$10.50');
  });

  it('formats EUR with € symbol', () => {
    expect(formatCurrency(999, 'EUR')).toBe('€9.99');
  });

  it('formats GBP with £ symbol', () => {
    expect(formatCurrency(500, 'GBP')).toBe('£5.00');
  });

  it('formats JPY with no decimal places', () => {
    expect(formatCurrency(1234, 'JPY')).toBe('¥1234');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('formats zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('uses absolute value for negative amounts', () => {
    expect(formatCurrency(-500, 'USD')).toBe('$5.00');
  });
});

describe('formatCurrencyWithSign', () => {
  it('prepends + for positive', () => {
    expect(formatCurrencyWithSign(500, 'USD')).toBe('+$5.00');
  });

  it('prepends - for negative', () => {
    expect(formatCurrencyWithSign(-500, 'USD')).toBe('-$5.00');
  });

  it('no sign for zero', () => {
    expect(formatCurrencyWithSign(0, 'USD')).toBe('$0.00');
  });
});

describe('addMoney', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('adds two Money values of the same currency', () => {
    const result = addMoney(
      { amountCents: 500, currency: 'USD' },
      { amountCents: 300, currency: 'USD' },
    );
    expect(result.amountCents).toBe(800);
    expect(result.currency).toBe('USD');
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('throws on currency mismatch', () => {
    expect(() =>
      addMoney(
        { amountCents: 500, currency: 'USD' },
        { amountCents: 300, currency: 'EUR' },
      ),
    ).toThrow('Currency mismatch');
  });
});

describe('distributeCentsEvenly', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('distributes 1000 cents evenly among 4', () => {
    expect(distributeCentsEvenly(1000, 4)).toEqual([250, 250, 250, 250]);
  });

  it('distributes remainder to front participants', () => {
    // 1000 / 3 → [334, 333, 333]
    expect(distributeCentsEvenly(1000, 3)).toEqual([334, 333, 333]);
  });

  it('always sums to totalCents', () => {
    for (const total of [1, 7, 100, 1001]) {
      for (const n of [1, 2, 3, 7]) {
        const dist = distributeCentsEvenly(total, n);
        const sum = dist.reduce((a, b) => a + b, 0);
        expect(sum).toBe(total);
      }
    }
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('throws when count is zero', () => {
    expect(() => distributeCentsEvenly(1000, 0)).toThrow('count must be > 0');
  });

  it('throws when count is negative', () => {
    expect(() => distributeCentsEvenly(1000, -1)).toThrow('count must be > 0');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('distributes zero across any count', () => {
    expect(distributeCentsEvenly(0, 5)).toEqual([0, 0, 0, 0, 0]);
  });

  it('distributes 1 cent among many — only first gets it', () => {
    const result = distributeCentsEvenly(1, 5);
    expect(result[0]).toBe(1);
    expect(result.slice(1)).toEqual([0, 0, 0, 0]);
  });
});

describe('roundMoney', () => {
  it('rounds to nearest integer', () => {
    expect(roundMoney(1.6)).toBe(2);
    expect(roundMoney(1.4)).toBe(1);
  });

  it('passes through integer values unchanged', () => {
    expect(roundMoney(100)).toBe(100);
  });
});

describe('makeMoney', () => {
  it('rounds cents to integer', () => {
    const m = makeMoney(99.9, 'USD');
    expect(m.amountCents).toBe(100);
    expect(m.currency).toBe('USD');
  });
});
