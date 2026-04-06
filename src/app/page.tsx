'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useAccount, useConnect, useDisconnect,
  useReadContracts, useReadContract,
  useWriteContract, useWaitForTransactionReceipt,
  useSwitchChain, useChainId,
  useWatchContractEvent, usePublicClient,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatUnits, parseUnits, erc20Abi } from 'viem';
import {
  ACTIVE_CONFIG, ACTIVE_NETWORK, ACTIVE_TOKENS, NETWORKS, isDeployed,
} from '@/config/contracts';
import { LeviTerminal } from '@/components/LeviTerminal';
import { ToastContainer, toast, dismiss, clearToasts } from '@/components/Toast';

/* ── ABI ─────────────────────────────────────────────────── */
const presaleAbi = [
  { inputs: [], name: 'totalSold', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalRaised', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'tokensPerUsdc', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'presaleAllocation', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'presaleActive', outputs: [{ type: 'bool' }], stateMutability: 'view', type: 'function' },
  {
    inputs: [{ name: 'payToken', type: 'address' }, { name: 'usdAmount', type: 'uint256' }],
    name: 'buyTokens', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    name: 'TokensPurchased', type: 'event',
    inputs: [
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'payToken', type: 'address', indexed: true },
      { name: 'usdAmount', type: 'uint256', indexed: false },
      { name: 'leviAmount', type: 'uint256', indexed: false },
    ],
  },
  { inputs: [], name: 'owner', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'token', type: 'address' }], name: 'withdrawToken', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const;

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(n: number, dec = 0) { return n.toLocaleString('en-US', { maximumFractionDigits: dec }); }

/* ── Scroll reveal ───────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Animated counter ────────────────────────────────────── */
function useCountUp(target: number, duration = 1500, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, active, duration]);
  return val;
}

/* ── Donut chart ─────────────────────────────────────────── */
function DonutChart() {
  const slices = [
    { pct: 50, color: '#3b82f6', label: 'Public Presale', sub: '500M LEVI' },
    { pct: 30, color: '#6366f1', label: 'Liquidity (Locked)', sub: '300M LEVI' },
    { pct: 20, color: '#10b981', label: 'Burned', sub: '200M LEVI' },
  ];
  const R = 80, CIRC = 2 * Math.PI * R;
  let offset = 0;
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current as Element);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center' }}>
      <svg ref={ref as React.RefObject<SVGSVGElement>} width={220} height={220} viewBox="-10 -10 220 220" style={{ flexShrink: 0 }}>
        <circle cx={100} cy={100} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={32} />
        {slices.map(({ pct, color }, i) => {
          const dash = animated ? (pct / 100) * CIRC : 0;
          const gap = CIRC - dash;
          const el = (
            <circle key={i} cx={100} cy={100} r={R}
              fill="none" stroke={color} strokeWidth={32}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * CIRC / 100}
              style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)', transformBox: 'fill-box', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x={100} y={94} textAnchor="middle" fill="#f1f5f9" fontSize={22} fontWeight={800} fontFamily="JetBrains Mono,monospace">1B</text>
        <text x={100} y={116} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={11} fontFamily="JetBrains Mono,monospace">$LEVI</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {slices.map(({ pct, color, label, sub }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}80` }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{pct}% — {sub}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 4, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          No team allocation · No insider tokens
        </div>
      </div>
    </div>
  );
}

/* ── Live buyers feed (real contract events) ─────────────── */
type Buyer = { addr: string; amount: number; time: string };

function BuyersFeed({ deployed }: { deployed: boolean }) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const publicClient = usePublicClient();

  // Load historical events on mount
  useEffect(() => {
    if (!deployed || !publicClient) return;
    const fetchLogs = async () => {
      try {
        const latest = await publicClient!.getBlockNumber();
        const from = latest > 10000n ? latest - 10000n : 0n;

        console.log(`BuyersFeed: Scanning from block ${from} to ${latest}`);
        const logs = await (publicClient as ReturnType<typeof usePublicClient>)!.getLogs({
          address: ACTIVE_CONFIG.presaleAddress,
          abi: presaleAbi,
          eventName: 'TokensPurchased',
          fromBlock: from,
          toBlock: latest
        });

        console.log("BuyersFeed: Found historical logs:", logs.length);
        const recent = logs.slice(-5).reverse().map((log, i) => ({
          addr: (log.args.buyer as string)?.slice(0, 6) ?? '0x????',
          amount: Number(formatUnits((log.args.leviAmount as bigint) ?? BigInt(0), 18)),
          time: i === 0 ? 'just now' : `${i * 3 + 2}m ago`,
        }));
        setBuyers(recent);
      } catch (err) {
        console.error("BuyersFeed Error:", err);
      }
    };
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployed]);

  // Watch for new live events
  useWatchContractEvent({
    address: ACTIVE_CONFIG.presaleAddress,
    abi: presaleAbi,
    eventName: 'TokensPurchased',
    onLogs(logs) {
      const newer: Buyer[] = logs.map(log => ({
        addr: (log.args.buyer as string)?.slice(0, 6) ?? '0x????',
        amount: Number(formatUnits((log.args.leviAmount as bigint) ?? BigInt(0), 18)),
        time: 'just now',
      }));
      setBuyers(prev => [...newer, ...prev].slice(0, 5));
    },
    enabled: deployed,
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
        ● Live On-Chain Activity
      </div>
      {buyers.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>
          {deployed ? 'Watching for transactions…' : 'Goes live at launch'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {buyers.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 1 - i * 0.15, transition: 'opacity 0.5s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#10b981' : 'var(--accent-primary)', flexShrink: 0 }} />
                <span className="jetbrains" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.addr}…</span>
                <span style={{ fontSize: '0.78rem' }}>bought</span>
                <span className="jetbrains" style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>{fmt(b.amount)} LEVI</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── FAQ ─────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <span style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem', transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      <div className={`faq-answer ${open ? 'open' : ''}`}>{a}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [buyAmount, setBuyAmount] = useState('1');
  const [selectedToken, setSelectedToken] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [buyStep, setBuyStep] = useState<'idle' | 'approving' | 'buying'>('idle');

  useEffect(() => { setMounted(true); }, []);
  useReveal();
  const pendingToastId = useRef<number | null>(null);

  const deployed = isDeployed();
  const ZERO = BigInt(0);
  const targetChainId = ACTIVE_NETWORK === 'testnet' ? NETWORKS.testnet.chainId : NETWORKS.mainnet.chainId;
  const wrongNetwork = mounted && isConnected && chainId !== targetChainId;

  /* ── Contract reads ──────────────────────────────────── */
  const { data: contractData, isLoading, refetch: refetchStats } = useReadContracts({
    contracts: deployed ? [
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'totalSold' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'totalRaised' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'tokensPerUsdc' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'presaleAllocation' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'presaleActive' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'owner' },
    ] : [],
    query: {
      refetchInterval: 5000,
    }
  });

  const token = ACTIVE_TOKENS[selectedToken];
  const usdAmount = parseFloat(buyAmount || '0');
  // Guard against NaN — parseUnits('NaN', 6) throws and crashes the page
  const safeUsd = isNaN(usdAmount) || usdAmount <= 0 ? 0 : Math.min(usdAmount, 10);
  const usdBigInt = mounted ? parseUnits(String(safeUsd), 6) : ZERO;

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    ...(mounted && isConnected && deployed ? {
      address: token.address, abi: erc20Abi, functionName: 'allowance',
      args: [address!, ACTIVE_CONFIG.presaleAddress],
    } : { address: token.address, abi: erc20Abi, functionName: 'allowance', args: ['0x0000000000000000000000000000000000000000' as `0x${string}`, ACTIVE_CONFIG.presaleAddress] }),
    query: {
      refetchInterval: 5000,
    }
  });
  const allowance = (allowanceRaw as bigint | undefined) ?? ZERO;
  const needsApprove = allowance < usdBigInt;

  /* ── Write contract ──────────────────────────────────── */
  const { writeContract, data: txHash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeError) {
      toast(writeError.message.slice(0, 80), 'error');
      setBuyStep('idle');
      resetWrite();
    }
  }, [writeError, resetWrite]);

  const handleWatchAsset = useCallback(async () => {
    if (!window.ethereum || !deployed) return;
    try {
      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: ACTIVE_CONFIG.tokenAddress,
            symbol: 'LEVI',
            decimals: 18,
            image: '', // Can add image URL later
          },
        },
      });
    } catch (e) {
      console.error('WatchAsset refused');
    }
  }, [deployed]);

  useEffect(() => {
    if (isConfirmed) {
      if (buyStep === 'approving') {
        if (pendingToastId.current) dismiss(pendingToastId.current);
        toast('Token approved! You can now buy $LEVI.', 'success');
        setBuyStep('idle');
        resetWrite();
        refetchAllowance();
      } else if (buyStep === 'buying') {
        if (pendingToastId.current) dismiss(pendingToastId.current);
        toast(`🎉 Successfully bought $LEVI!`, 'success');
        setBuyStep('idle');
        resetWrite();
        refetchStats();
        handleWatchAsset();
      }
    }
  }, [isConfirmed, buyStep, resetWrite, refetchStats, refetchAllowance, handleWatchAsset]);

  const handleBuy = useCallback(() => {
    if (!isConnected) { connect({ connector: injected() }); return; }
    if (wrongNetwork) { switchChain({ chainId: targetChainId }); return; }
    if (usdAmount < 1 || usdAmount > 10) { toast('Amount must be between $1 and $10', 'error'); return; }

    // Clear any previous pending toast before starting new step
    if (pendingToastId.current) dismiss(pendingToastId.current);

    if (needsApprove) {
      setBuyStep('approving');
      pendingToastId.current = toast('Step 1: Approve token spending', 'pending');
      writeContract({
        address: token.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [ACTIVE_CONFIG.presaleAddress, usdBigInt],
      });
    } else {
      setBuyStep('buying');
      pendingToastId.current = toast('Step 2: Confirm $LEVI purchase', 'pending');
      writeContract({
        address: ACTIVE_CONFIG.presaleAddress,
        abi: presaleAbi,
        functionName: 'buyTokens',
        args: [token.address, usdBigInt],
      });
    }
  }, [isConnected, wrongNetwork, usdAmount, needsApprove, connect, switchChain, targetChainId, writeContract, token.address, usdBigInt]);

  const totalSoldRaw = deployed ? (contractData?.[0]?.result ?? ZERO) as bigint : ZERO;
  const totalRaisedRaw = deployed ? (contractData?.[1]?.result ?? ZERO) as bigint : ZERO;
  const tokensPerUsdcRaw = deployed ? (contractData?.[2]?.result ?? ZERO) as bigint : ZERO;
  const presaleAllocRaw = deployed ? (contractData?.[3]?.result ?? ZERO) as bigint : ZERO;
  const presaleActive = deployed ? (contractData?.[4]?.result ?? false) as boolean : false;
  const contractOwner = deployed ? (contractData?.[5]?.result ?? '') as string : '';

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (mounted && isConnected && address && contractOwner) {
      const match = address.toLowerCase() === contractOwner.toLowerCase();
      setIsAdmin(match);
      if (match) console.log("Admin verified!");
    } else {
      setIsAdmin(false);
    }
  }, [mounted, isConnected, address, contractOwner]);

  const totalSold = Number(formatUnits(totalSoldRaw, 18));
  const totalRaised = Number(formatUnits(totalRaisedRaw, 6));
  const tokensPerUsdc = Number(tokensPerUsdcRaw);
  const presaleAlloc = Number(formatUnits(presaleAllocRaw, 18));
  const progress = presaleAlloc > 0 ? (totalSold / presaleAlloc) * 100 : 0;
  const price = tokensPerUsdc > 0 ? 1 / tokensPerUsdc : 0;
  const leviOut = usdAmount * tokensPerUsdc;

  const handleWithdraw = useCallback((tokenAddr: string, symbol: string) => {
    toast(`Withdrawing ${symbol}…`, 'pending');
    writeContract({
      address: ACTIVE_CONFIG.presaleAddress,
      abi: presaleAbi,
      functionName: 'withdrawToken',
      args: [tokenAddr as `0x${string}`],
    });
  }, [writeContract]);

  const animatedSold = useCountUp(totalSold, 1400, deployed && !isLoading);
  const animatedRaised = useCountUp(totalRaised, 1400, deployed && !isLoading);

  const networkLabel = ACTIVE_NETWORK === 'testnet' ? '🟡 Testnet (Moderato)' : '🟢 Mainnet';
  const tickers = ['ON-CHAIN RESEARCH', 'REAL-TIME INTELLIGENCE', 'TOKEN-GATED', 'TEMPO NATIVE', 'AI INSIGHTS', 'FAIR MINT', 'FIXED SUPPLY', 'BUILT FOR RESEARCH'];

  const isBusy = isPending || isConfirming || buyStep !== 'idle';
  const btnLabel = !mounted || !isConnected
    ? 'Connect Wallet'
    : wrongNetwork
      ? '⚡ Switch to Tempo'
      : !deployed
        ? 'Contract Not Yet Deployed'
        : !presaleActive
          ? 'Presale Not Active'
          : isBusy
            ? (buyStep === 'approving' ? 'Approving…' : isConfirming ? 'Confirming…' : 'Processing…')
            : needsApprove
              ? `Approve ${token.symbol}`
              : 'Buy $LEVI →';

  // Fix hydration for disabled attribute
  const btnDisabled = mounted && (deployed && (!presaleActive || isBusy) && isConnected && !wrongNetwork);

  return (
    <main style={{ paddingBottom: 0 }}>
      <ToastContainer />
      {termOpen && <LeviTerminal onClose={() => setTermOpen(false)} />}

      {/* ── LEVI Terminal Button ─────────────────────── */}
      <button
        onClick={() => setTermOpen(true)}
        className="levi-btn"
        title="Open LEVI Agent Terminal"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        <span>LEVI</span>
        <span className="levi-btn-dot" />
      </button>

      {/* ── MARQUEE ───────────────────────────────────── */}
      <div className="marquee-wrapper" style={{ marginTop: 72 }}>
        <div className="marquee-track">
          {[...tickers, ...tickers].map((t, i) => (
            <div key={i} className="marquee-item">
              <span className="marquee-dot" /><span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────── */}
      <section id="home" className="container flex-center" style={{
        minHeight: 'calc(100vh - 72px)', flexDirection: 'column',
        textAlign: 'center', gap: 28, paddingTop: 60, paddingBottom: 60, position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="animate-drift" style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', top: '-10%', left: '-5%', filter: 'blur(60px)' }} />
          <div className="animate-drift" style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', top: '20%', right: '-5%', filter: 'blur(60px)', animationDelay: '-5s' }} />
          <div className="animate-drift" style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', bottom: '0%', left: '30%', filter: 'blur(50px)', animationDelay: '-2s' }} />
        </div>

        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <div className="jetbrains section-label" style={{ color: 'var(--accent-primary)' }}>
            TEMPO NETWORK · AI AGENT PROTOCOL · CHAIN ID 42431
          </div>
        </div>

        <div className="animate-fade-in delay-1" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="shimmer-text animate-pulse-glow" style={{
            fontSize: 'clamp(3.2rem, 8vw, 5.8rem)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-4px', marginBottom: 32,
          }}>
            Onchain Intelligence. <br /> Built for Tempo.
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 20px',
            background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 40, backdropFilter: 'blur(12px)', margin: '0 auto'
          }}>
            <span className="jetbrains" style={{ fontSize: '0.75rem', letterSpacing: 3, color: '#3b82f6', fontWeight: 700 }}>
              TOKEN-GATED · NATIVE · RESEARCH-DRIVEN
            </span>
          </div>
        </div>

        <div className="animate-fade-in delay-2" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {!mounted || !isConnected ? (
            <button className="btn-primary" onClick={() => connect({ connector: injected() })} style={{ padding: '14px 36px', fontSize: '1rem' }}>
              Connect Wallet
            </button>
          ) : wrongNetwork ? (
            <button className="btn-primary" onClick={() => switchChain({ chainId: targetChainId })} style={{ padding: '14px 36px', fontSize: '1rem' }}>
              ⚡ Switch to Tempo
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => disconnect()} style={{ padding: '14px 36px', fontSize: '1rem' }}>
              🟢 {address?.slice(0, 6)}…{address?.slice(-4)}
            </button>
          )}
          <a href="#presale" className="btn-secondary" style={{ padding: '14px 36px', fontSize: '1rem', textDecoration: 'none' }}>
            Join Presale →
          </a>
        </div>

        {/* Live stats ribbon */}
        <div className="animate-fade-in delay-3 glass-panel" style={{
          display: 'flex', flexWrap: 'wrap', gap: 0, padding: 0, overflow: 'hidden', position: 'relative', zIndex: 1, width: '100%', maxWidth: 700,
        }}>
          {[
            { label: 'Price', value: deployed && !isLoading ? `$${price.toFixed(6)}` : '$—', accent: 'var(--accent-primary)' },
            { label: 'Rate', value: deployed && !isLoading ? `${fmt(tokensPerUsdc)} / USD` : '— / USD', accent: 'var(--accent-secondary)' },
            { label: 'Tokens Sold', value: deployed && !isLoading ? fmt(animatedSold) : '0', accent: 'var(--text-primary)' },
            { label: 'USD Raised', value: deployed && !isLoading ? `$${animatedRaised.toFixed(2)}` : '$0.00', accent: 'var(--text-primary)' },
          ].map(({ label, value, accent }, i) => (
            <div key={label} style={{ flex: '1 1 25%', padding: '20px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--glass-border)' : 'none' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div className="jetbrains" style={{ fontSize: '1rem', fontWeight: 700, color: accent }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Wrong network banner */}
        {wrongNetwork && (
          <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1, padding: '12px 20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 10, fontSize: '0.85rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 10 }}>
            ⚠ You&apos;re on the wrong network.
            <button onClick={() => switchChain({ chainId: targetChainId })}
              style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              Switch to Tempo
            </button>
          </div>
        )}
      </section>

      {/* ── ABOUT ─────────────────────────────────────── */}
      <section id="about" style={{ padding: '100px 0', background: 'rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label" style={{ color: 'var(--accent-purple)' }}>CAPABILITIES</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>
              What LEVI <span className="text-gradient">Can Do</span>
            </h2>
          </div>
          <div className="grid-2">
            {[
              { accentColor: '#3b82f6', tag: 'AUTONOMOUS', title: 'Autonomous Research Layer', body: 'LEVI continuously monitors and processes onchain activity, providing real-time insights without manual tracking.', stat: '24/7', statLabel: 'Active scanning' },
              { accentColor: '#6366f1', tag: 'INTELLIGENCE', title: 'Intelligence, Not Just Data', body: 'LEVI identifies patterns like accumulation and liquidity shifts to provide meaningful, actionable insights.', stat: '100%', statLabel: 'Onchain data' },
              { accentColor: '#94a3b8', tag: 'TOKEN-GATED', title: 'Token-Gated Access System', body: 'Only holders above a threshold can access LEVI, ensuring terminal performance and high-quality usage for serious users.', stat: 'GAated', statLabel: 'Access control' },
              { accentColor: '#3b82f6', tag: 'TEMPO NATIVE', title: 'Built on Tempo Chain', body: 'LEVI operates natively on Tempo, enabling efficient, near-zero fee, and low-cost real-time interactions.', stat: '42431', statLabel: 'Chain ID' },
            ].map(({ accentColor, tag, title, body, stat, statLabel }, idx) => (
              <div key={title} className={`reveal reveal-delay-${idx + 1} glass-card-hover`} style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid var(--glass-border)',
                borderTop: `2px solid ${accentColor}`, borderRadius: 20, padding: 36,
                display: 'flex', flexDirection: 'column', gap: 0, transition: 'transform 0.3s ease, box-shadow 0.3s ease', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`, border: `1px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {idx === 0 && <><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></>}
                      {idx === 1 && <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>}
                      {idx === 2 && <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>}
                      {idx === 3 && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />}
                    </svg>
                  </div>
                  <span className="jetbrains" style={{ fontSize: '0.62rem', letterSpacing: 3, color: accentColor, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, padding: '4px 10px', borderRadius: 20 }}>{tag}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.9rem', flexGrow: 1, marginBottom: 24 }}>{body}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                  <span className="jetbrains" style={{ fontSize: '1.4rem', fontWeight: 800, color: accentColor }}>{stat}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section id="how" style={{ padding: '80px 0 100px', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ color: 'var(--accent-primary)' }}>PROCESS</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>How It <span className="text-gradient">Works</span></h2>
          </div>
          <div className="grid-3">
            {[
              { step: '01', title: 'Connect Your Wallet', body: 'Click "Connect Wallet" and link any EVM-compatible wallet (MetaMask, Rabby etc.) to the Tempo Testnet.', color: 'var(--accent-primary)' },
              { step: '02', title: 'Choose Amount & Token', body: 'Enter $1–$10 or download "skill.md" from the terminal to let your AI agent buy for you autonomously via pathUSD/AlphaUSD.', color: 'var(--accent-secondary)' },
              { step: '03', title: 'Receive $LEVI', body: 'Approve, confirm the buy. $LEVI lands in your wallet instantly at a fixed rate. No slippage. No tricks.', color: 'var(--accent-accent)' },
            ].map(({ step, title, body, color }, i) => (
              <div key={step} className={`reveal reveal-delay-${i + 1} glass-panel`} style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div className="step-number" style={{ background: `linear-gradient(135deg, ${color}, rgba(99,102,241,0.8))` }}>{step}</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: 'center', marginTop: 48, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span className="jetbrains">Powered by Tempo chain · pathUSD stablecoin · Smart contract escrow</span>
          </div>
        </div>
      </section>

      {/* ── PRESALE ───────────────────────────────────── */}
      <section id="presale" className="container" style={{ padding: '100px 0' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ color: deployed ? 'var(--accent-primary)' : '#f59e0b' }}>
            {deployed ? (presaleActive ? '● PRESALE IS LIVE' : '● PRESALE ENDED') : '◌ PRESALE COMING SOON'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>
            Buy <span className="text-gradient">$LEVI</span>
          </h2>
          <p className="jetbrains" style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 8 }}>Network: {networkLabel}</p>
        </div>

        <div className="presale-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 980, margin: '0 auto', alignItems: 'start' }}>

          {/* ─ BUY CARD ─────────────────────── */}
          <div className="reveal-left glass-panel glass-glow" style={{ padding: 40, border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 0 80px rgba(59,130,246,0.08)', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p className="jetbrains" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: 3 }}>FAIR MINT · FIXED SUPPLY</p>
            </div>

            {/* YOU PAY */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', letterSpacing: 2, textTransform: 'uppercase' }}>You Pay</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['1', '10'].map(v => (
                    <button key={v} onClick={() => setBuyAmount(v)} style={{
                      background: buyAmount === v ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${buyAmount === v ? 'rgba(59,130,246,0.6)' : 'var(--glass-border)'}`,
                      color: buyAmount === v ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem',
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    }}>${v}</button>
                  ))}
                </div>
              </div>
              <div className="input-container" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <input
                  type="number"
                  className="input-field-borderless"
                  value={buyAmount}
                  min="1" max="10"
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setBuyAmount(e.target.value === '' ? '' : String(Math.min(v, 10)));
                  }}
                  placeholder="0.0"
                  style={{ fontSize: '2rem', fontWeight: 700 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                  {ACTIVE_TOKENS.map((t, i) => (
                    <button key={t.symbol} onClick={() => setSelectedToken(i)} style={{
                      background: selectedToken === i ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedToken === i ? 'rgba(59,130,246,0.6)' : 'var(--glass-border)'}`,
                      color: selectedToken === i ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      padding: '5px 12px', borderRadius: 7, fontSize: '0.75rem',
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap',
                    }}>{t.symbol}</button>
                  ))}
                </div>
              </div>
              <div className="jetbrains" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 5 }}>
                {token.address.slice(0, 14)}…{token.address.slice(-8)}
              </div>
            </div>

            {/* Arrow */}
            <div className="swap-icon-wrapper">
              <div className="swap-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </div>
            </div>

            {/* YOU RECEIVE */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', letterSpacing: 2, textTransform: 'uppercase' }}>You Receive</span>
              <div className="input-container readonly" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <div className="jetbrains text-gradient" style={{ fontSize: '1.8rem', fontWeight: 700, flexGrow: 1, minWidth: 0 }}>
                  {deployed && tokensPerUsdc > 0 ? fmt(leviOut) : '—'}
                </div>
                <span className="token-badge levi">⬡ LEVI</span>
              </div>
              <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: 6 }}>
                {deployed && tokensPerUsdc > 0 ? `1 USD = ${fmt(tokensPerUsdc)} LEVI` : 'Rate available at launch'}
              </div>
            </div>

            {/* CTA */}
            <button
              className="btn-primary"
              style={{ width: '100%', padding: 18, fontSize: '0.95rem', position: 'relative' }}
              onClick={handleBuy}
              disabled={!!btnDisabled}
            >
              {isBusy && (
                <span style={{
                  position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }} />
              )}
              {btnLabel}
            </button>

            {/* Two-step indicator */}
            {mounted && isConnected && deployed && presaleActive && needsApprove && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: buyStep === 'approving' ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                  {buyStep === 'approving' ? '⟳' : '○'} Step 1: Approve
                </span>
                <span>→</span>
                <span style={{ color: buyStep === 'buying' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {buyStep === 'buying' ? '⟳' : '○'} Step 2: Buy
                </span>
              </div>
            )}

            {deployed && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20, fontSize: '0.72rem' }}>
                <a href={`${ACTIVE_CONFIG.explorer}/address/${ACTIVE_CONFIG.tokenAddress}`} target="_blank" className="jetbrains" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Token ↗</a>
                <a href={`${ACTIVE_CONFIG.explorer}/address/${ACTIVE_CONFIG.presaleAddress}`} target="_blank" className="jetbrains" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Presale ↗</a>
              </div>
            )}

            {/* ADMIN PANEL */}
            {isAdmin && (
              <div className="reveal" style={{ marginTop: 24, padding: '20px', background: 'rgba(59,130,246,0.05)', border: '1px dashed var(--accent-primary)', borderRadius: 12 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
                  🔒 Admin Controls
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {ACTIVE_TOKENS.map(t => (
                    <button
                      key={t.symbol}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.75rem', borderColor: 'var(--accent-primary)' }}
                      onClick={() => handleWithdraw(t.address, t.symbol)}
                    >
                      Withdraw {t.symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─ RIGHT COLUMN ────────────────── */}
          <div className="reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="grid-4" style={{ gap: 14 }}>
              {[
                { label: 'Token Price', value: deployed && !isLoading ? `$${price.toFixed(6)}` : '$—', accent: 'var(--accent-primary)' },
                { label: 'Rate', value: deployed && !isLoading ? `${fmt(tokensPerUsdc)} / USD` : '—', accent: 'var(--accent-secondary)' },
                { label: 'Tokens Sold', value: deployed && !isLoading ? fmt(animatedSold) : '0', accent: 'var(--text-primary)' },
                { label: 'USD Raised', value: deployed && !isLoading ? `$${animatedRaised.toFixed(2)}` : '$0', accent: 'var(--text-primary)' },
              ].map(({ label, value, accent }) => (
                <div key={label} className="glass-panel" style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                  <div className="jetbrains" style={{ fontSize: '1rem', fontWeight: 700, color: accent, wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Presale Progress</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>{fmt(totalSold)} / 500,000,000 LEVI</div>
                </div>
                <div className="jetbrains text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {deployed ? `${progress.toFixed(2)}%` : '0.00%'}
                </div>
              </div>
              <div style={{ height: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <div style={{ width: `${deployed ? Math.min(progress, 100) : 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 5, boxShadow: '0 0 10px rgba(59,130,246,0.6)', transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span>0</span><span>500,000,000 LEVI</span>
              </div>
            </div>

            {/* Accepted tokens */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Accepted Tokens</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ACTIVE_TOKENS.map(t => (
                  <div key={t.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="token-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', fontSize: '0.8rem', border: '1px solid var(--glass-border)' }}>{t.symbol}</span>
                    <span className="jetbrains" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{t.address.slice(0, 10)}…{t.address.slice(-6)}</span>
                  </div>
                ))}
              </div>
              {!deployed && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, fontSize: '0.76rem', color: '#f59e0b' }}>
                  ⚠ Deploying soon — live data coming after launch
                </div>
              )}
            </div>

            {/* Live buyers feed */}
            <BuyersFeed deployed={deployed} />
          </div>
        </div>
      </section>

      {/* ── TOKENOMICS ────────────────────────────────── */}
      <section id="tokenomics" style={{ padding: '80px 0 100px', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ color: 'var(--accent-purple)' }}>DISTRIBUTION</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>
              $LEVI <span className="text-gradient">Tokenomics</span>
            </h2>
          </div>
          <div className="glass-panel reveal" style={{ padding: 48, maxWidth: 760, margin: '0 auto' }}>
            <DonutChart />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section style={{ padding: '60px 0 100px', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ color: 'var(--accent-cyan)' }}>QUESTIONS</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>FAQ</h2>
          </div>
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, margin: '0 auto' }}>
            <FaqItem q="What is LEVI?" a="LEVI is an AI-powered research agent built for the Tempo network. It analyzes onchain activity and converts raw data into actionable insights." />
            <FaqItem q="What is the Tempo Network?" a="Tempo is an EVM-compatible Layer 1 blockchain designed for fast and low-cost transactions. LEVI is built natively on it for real-time analysis." />
            <FaqItem q="How do I participate in the presale?" a="Users will connect their wallet via the official platform and contribute using supported assets. Full instructions will be provided before launch." />
            <FaqItem q="Is there a minimum or maximum purchase?" a="Yes. Limits will be set to ensure fair distribution. Exact values will be announced soon." />
            <FaqItem q="How does LEVI generate research?" a="LEVI utilizes specialized LLMs optimized for blockchain data. It scans the Tempo L1 in real-time, identifying whale accumulation, liquidity shifts, and unusual contract deployments." />
            <FaqItem q="Is the research exclusive to $LEVI holders?" a="Yes. Access to the full LEVI Intelligence Terminal and real-time research feeds is token-gated. A minimum $LEVI balance is required to unlock the most profitable onchain insights." />
            <FaqItem q="What is the total supply of $LEVI?" a="The total supply is fixed at 1,000,000,000 (1 Billion) tokens. No additional tokens can ever be minted, ensuring deflationary pressure as the ecosystem expands." />
            <FaqItem q="Does LEVI support other chains besides Tempo?" a="LEVI is currently optimized for the Tempo L1 to take advantage of near-zero fees and instant finality. However, cross-chain data ingestion for a broader research scope is planned for Phase 4." />
            <FaqItem q="What happens after the presale?" a="The roadmap includes token launch, liquidity deployment, phased access rollout, and continuous feature expansion for the research engine." />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '60px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div className="text-gradient jetbrains" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 14 }}>LEVI</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 280 }}>
                An AI-powered onchain research agent built for Tempo. Turning blockchain data into real-time intelligence.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Navigate</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['Home', '#home'], ['About', '#about'], ['How It Works', '#how'], ['Tokenomics', '#tokenomics'], ['Presale', '#presale']].map(([label, href]) => (
                  <a key={label} href={href} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['X/Twitter', '#'],
                  ['GitHub', '#'],
                ].map(([label, href]) => (
                  <a key={label} href={href} target="_blank" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>{label} ↗</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>© 2026 LEVI Protocol · Built on Tempo Network</span>
            <span className="jetbrains" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Chain ID: {ACTIVE_NETWORK === 'testnet' ? '42431' : '4217'}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
