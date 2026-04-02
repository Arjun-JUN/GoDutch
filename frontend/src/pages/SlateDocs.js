import React, { useState } from 'react';
import { 
  AppShell, 
  PageContent, 
  PageHero, 
  Header, 
  AppButton, 
  AppSurface, 
  AppInput, 
  AppSelect, 
  AppTextarea, 
  Field, 
  StatCard, 
  EmptyState, 
  Callout, 
  MemberBadge, 
  IconBadge, 
  ExpenseCard,
  AppModal,
  ModalHeader,
  InDevelopmentOverlay
} from '@/slate';
import { 
  Cards, 
  Textbox, 
  CursorClick, 
  Stack, 
  ProjectorScreen, 
  Palette, 
  Plus, 
  User, 
  Receipt, 
  Info, 
  Check, 
  X, 
  ChartBar,
  House
} from '@/slate/icons';

const SlateDocs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [demoValue, setDemoValue] = useState('1');

  // Mock data for ExpenseCard
  const mockExpense = {
    id: '1',
    merchant: 'Documentation Store',
    date: 'April 2, 2026',
    amount: 1299.00
  };

  return (
    <AppShell className="bg-[var(--app-background-start)]">
      <Header onLogout={() => console.log('Logout')} />
      
      <PageContent>
        <PageHero 
          eyebrow="Design System"
          title="Slate Library"
          description="A centralized collection of premium UI components and design tokens for GoDutch."
          actions={
            <AppButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <House size={18} weight="bold" />
              Back to Top
            </AppButton>
          }
        />

        <div className="space-y-16 mt-12 pb-20">
          
          {/* Section: Design Tokens */}
          <section id="tokens">
            <div className="flex items-center gap-3 mb-6">
              <IconBadge icon={Info} tone="primary" />
              <h2 className="text-2xl font-extrabold tracking-tight">Design Tokens</h2>
            </div>
            <Callout className="mb-8">
              Slate uses CSS Custom Properties defined in <code>tokens.css</code> for a single source of truth.
            </Callout>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 rounded-2xl bg-[var(--app-primary)] border border-[var(--app-border)]" />
                <p className="text-xs font-bold text-center">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-2xl bg-[var(--app-background-top)] border border-[var(--app-border)]" />
                <p className="text-xs font-bold text-center">BG Top</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-2xl bg-[var(--app-surface-bg)] border border-[var(--app-border)]" />
                <p className="text-xs font-bold text-center">Surface Glass</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-2xl bg-[var(--app-soft-strong)] border border-[var(--app-border)]" />
                <p className="text-xs font-bold text-center">Soft Strong</p>
              </div>
            </div>
          </section>

          {/* Section: Interactive Elements */}
          <section id="buttons">
            <div className="flex items-center gap-3 mb-6">
              <IconBadge icon={CursorClick} tone="primary" />
              <h2 className="text-2xl font-extrabold tracking-tight">Interactive Elements</h2>
            </div>
            <AppSurface variant="solid" className="p-8">
              <h3 className="text-lg font-bold mb-6">AppButton Variants</h3>
              <div className="flex flex-wrap gap-4 items-center mb-10">
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton variant="primary">Primary Action</AppButton>
                  <code className="text-[10px] opacity-60">variant=&quot;primary&quot;</code>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton variant="secondary">Secondary</AppButton>
                  <code className="text-[10px] opacity-60">variant=&quot;secondary&quot;</code>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton variant="ghost">Ghost Button</AppButton>
                  <code className="text-[10px] opacity-60">variant=&quot;ghost&quot;</code>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton variant="icon"><Plus size={20} weight="bold" /></AppButton>
                  <code className="text-[10px] opacity-60">variant=&quot;icon&quot;</code>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-6">Button Sizes</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton size="sm">Small</AppButton>
                  <code className="text-[10px] opacity-60">size=&quot;sm&quot;</code>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton size="md">Medium (Default)</AppButton>
                  <code className="text-[10px] opacity-60">size=&quot;md&quot;</code>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <AppButton size="lg">Large Scale</AppButton>
                  <code className="text-[10px] opacity-60">size=&quot;lg&quot;</code>
                </div>
              </div>
            </AppSurface>
          </section>

          {/* Section: Form Controls */}
          <section id="forms">
            <div className="flex items-center gap-3 mb-6">
              <IconBadge icon={Textbox} tone="primary" />
              <h2 className="text-2xl font-extrabold tracking-tight">Form Controls</h2>
            </div>
            <AppSurface variant="glass" className="p-8 space-y-6">
              <Field label="Standard Input" htmlFor="input-demo">
                <AppInput id="input-demo" placeholder="Type something..." />
              </Field>
              
              <div className="grid md:grid-cols-2 gap-6">
                <AppSelect
                  label="Select Menu"
                  value={demoValue}
                  onValueChange={setDemoValue}
                  options={[
                    { label: 'High Priority', value: '1', icon: Check },
                    { label: 'Receipt Attached', value: '2', icon: Receipt },
                    { label: 'Personal Expense', value: '3', icon: User },
                  ]}
                  icon={Stack}
                  placeholder="Choose an option..."
                />
                <Field label="Status Badge">
                  <div className="flex gap-2">
                    <MemberBadge>Normal Badge</MemberBadge>
                    <MemberBadge active>Active Badge</MemberBadge>
                  </div>
                </Field>
              </div>

              <Field label="Text Area Content">
                <AppTextarea placeholder="Longer notes go here..." rows={4} />
              </Field>
            </AppSurface>
          </section>

          {/* Section: Layout & Surfaces */}
          <section id="surfaces">
            <div className="flex items-center gap-3 mb-6">
              <IconBadge icon={Stack} tone="primary" />
              <h2 className="text-2xl font-extrabold tracking-tight">Layout & Surfaces</h2>
            </div>
            
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Glass Surface</p>
                  <AppSurface variant="glass" className="p-8 text-center">
                    Universal Container
                  </AppSurface>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Solid Surface</p>
                  <AppSurface variant="solid" className="p-8 text-center font-bold">
                    Strong Emphasis
                  </AppSurface>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Expense Card</p>
                <ExpenseCard 
                  expense={mockExpense} 
                  amount={mockExpense.amount} 
                  onClick={() => alert('Card clicked!')} 
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <StatCard 
                  label="Monthly Spend" 
                  value="Rs 12,450" 
                  icon={ChartBar}
                  description="Up 12% from last month"
                />
                <StatCard 
                  label="Average Split" 
                  value="Rs 450" 
                  indicatorClassName="bg-blue-400"
                />
                <StatCard 
                  label="Pending Dues" 
                  value="Rs 2,100" 
                  valueClassName="text-[var(--app-danger)]"
                />
              </div>

              <EmptyState 
                icon={Receipt} 
                title="No expenses found" 
                description="Your ledger looks pristine. Start splitting costs with friends!"
                action={<AppButton size="sm">Create First Expense</AppButton>}
              />
            </div>
          </section>

          {/* Section: Modals & Overlays */}
          <section id="modals">
            <div className="flex items-center gap-3 mb-6">
              <IconBadge icon={ProjectorScreen} tone="primary" />
              <h2 className="text-2xl font-extrabold tracking-tight">Modals & Overlays</h2>
            </div>
            <div className="flex gap-4">
              <AppButton variant="secondary" onClick={() => setIsModalOpen(true)}>
                Open Standard Modal
              </AppButton>
              <AppButton variant="secondary" onClick={() => {
                setShowOverlay(true);
                setTimeout(() => setShowOverlay(false), 3000);
              }}>
                Trigger Dev Overlay (3s)
              </AppButton>
            </div>

            <AppModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <ModalHeader 
                title="Design System Modal" 
                description="This is the standardized modal component with consistent typography and spacing."
                onClose={() => setIsModalOpen(false)}
              />
              <div className="space-y-4">
                <Callout>
                  Modals use <code>framer-motion</code> for smooth entry and exit animations.
                </Callout>
                <div className="flex justify-end">
                  <AppButton onClick={() => setIsModalOpen(false)}>Understood</AppButton>
                </div>
              </div>
            </AppModal>

            {showOverlay && <InDevelopmentOverlay />}
          </section>

          {/* Section: Icons */}
          <section id="icons">
            <div className="flex items-center gap-3 mb-6">
              <IconBadge icon={Palette} tone="primary" />
              <h2 className="text-2xl font-extrabold tracking-tight">Centralized Icons</h2>
            </div>
            <Callout className="mb-6">
              Always import icons from <code>@/slate/icons</code>. This uses Phosphor React with standardized weight (Bold/Regular).
            </Callout>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6 p-8 bg-white rounded-[2rem] border border-[var(--app-border)]">
              <div className="flex flex-col items-center gap-2"><User size={24} weight="bold" /><span className="text-[10px]">User</span></div>
              <div className="flex flex-col items-center gap-2"><Check size={24} weight="bold" /><span className="text-[10px]">Check</span></div>
              <div className="flex flex-col items-center gap-2"><X size={24} weight="bold" /><span className="text-[10px]">X</span></div>
              <div className="flex flex-col items-center gap-2"><Plus size={24} weight="bold" /><span className="text-[10px]">Plus</span></div>
              <div className="flex flex-col items-center gap-2"><Receipt size={24} weight="bold" /><span className="text-[10px]">Receipt</span></div>
              <div className="flex flex-col items-center gap-2"><Info size={24} weight="bold" /><span className="text-[10px]">Info</span></div>
              <div className="flex flex-col items-center gap-2"><Palette size={24} weight="bold" /><span className="text-[10px]">Palette</span></div>
            </div>
          </section>

        </div>
      </PageContent>
    </AppShell>
  );
};

export default SlateDocs;
