import { Receipt } from '@phosphor-icons/react';

export function ExpenseCard({ expense, amount, amountLabel, onClick, icon: Icon = Receipt }) {
  return (
    <button
      data-testid={`expense-${expense.id}`}
      onClick={onClick}
      className="w-full flex items-stretch justify-between gap-3 p-4 md:p-5 rounded-[2rem] border border-[var(--app-border)] bg-white text-left transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e9efee] text-[var(--app-foreground)]">
          <Icon size={24} weight="regular" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-[17px] sm:text-lg font-extrabold text-[var(--app-foreground)] leading-tight whitespace-normal break-words line-clamp-2" data-testid={`expense-merchant-${expense.id}`}>
            {expense.merchant}
          </h3>
          <p className="mt-1.5 text-[13px] font-semibold text-[var(--app-foreground)] opacity-60">{expense.date}</p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center text-right pl-2 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-sm font-extrabold text-[var(--app-foreground)] leading-none mb-1 opacity-80">Rs</span>
          <span className="text-[22px] sm:text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)] leading-none" data-testid={`expense-amount-${expense.id}`}>
            {Number(amount).toFixed(2)}
          </span>
        </div>
        <div className="mt-2 text-[10px] font-bold tracking-[0.15em] text-[var(--app-foreground)] opacity-50 uppercase text-right max-w-[60px] sm:max-w-none leading-tight">
          {amountLabel || (
            <>
              YOUR<br className="sm:hidden" /> SHARE
            </>
          )}
        </div>
      </div>
    </button>
  );
}
