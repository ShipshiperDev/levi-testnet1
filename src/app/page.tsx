'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  useAccount, useConnect, useDisconnect,
  useReadContracts, useReadContract,
  useWriteContract, useWaitForTransactionReceipt,
  useSwitchChain, useChainId,
  useWatchContractEvent, usePublicClient,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatUnits, parseUnits, erc20Abi, parseAbiItem, decodeEventLog, maxUint256 } from 'viem';
import {
  ACTIVE_CONFIG, ACTIVE_NETWORK, ACTIVE_TOKENS, NETWORKS, isDeployed,
} from '@/config/contracts';
import { LeviTerminal } from '@/components/LeviTerminal';
import { ToastContainer, toast, dismiss, clearToasts } from '@/components/Toast';
import { useLanguage } from '@/context/LanguageContext';

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
  { inputs: [{ name: '_tokensPerUsdc', type: 'uint256' }], name: 'setTokensPerUsdc', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'token', type: 'address' }], name: 'withdrawToken', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'presaleStartTime', outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '_startTime', type: 'uint256' }], name: 'setPresaleStartTime', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const;

/* ── Universal State (Edit here for global updates) ────────── */
const PRESALE_START_TIME = "2026-04-12T12:00:00Z"; // UTC ISO Format

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(n: number, dec = 0) { return n.toLocaleString('en-US', { maximumFractionDigits: dec }); }

/* ── Scroll reveal ───────────────────────────────────────── */
function useReveal(deps: any[] = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
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
function DonutChart({ dict }: { dict: any }) {
  const slices = [
    { pct: 50, color: '#3b82f6', label: dict.tokenomics.chart[0].label, sub: dict.tokenomics.chart[0].sub },
    { pct: 30, color: '#6366f1', label: dict.tokenomics.chart[1].label, sub: dict.tokenomics.chart[1].sub },
    { pct: 10, color: '#a855f7', label: dict.tokenomics.chart[2].label, sub: dict.tokenomics.chart[2].sub },
    { pct: 10, color: '#10b981', label: dict.tokenomics.chart[3].label, sub: dict.tokenomics.chart[3].sub },
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
        <text x={100} y={94} textAnchor="middle" fill="#f1f5f9" fontSize={22} fontWeight={800} fontFamily="JetBrains Mono,monospace">100M</text>
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
          {dict.tokenomics.notice}
        </div>
      </div>
    </div>
  );
}

/* ── Live buyers feed ─────────────────────────────────── */
type Buyer = { addr: string; amount: number; time: string };

function BuyersFeed({ deployed }: { deployed: boolean }) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!deployed || !publicClient) return;
    const fetchLogs = async () => {
      try {
        const latest = await publicClient!.getBlockNumber();
        const from = latest > 10000n ? latest - 10000n : 0n;
        const logs = await (publicClient as any)!.getLogs({
          address: ACTIVE_CONFIG.presaleAddress,
          fromBlock: from,
          toBlock: latest,
          topics: ['0x6faf93231a456e552dbc9961f58d9713ee4f2e69d15f1975b050ef0911053a7b'],
        });

        const recent = logs.slice(-5).reverse().map((log: any, i: number) => {
          try {
            const decoded = decodeEventLog({ abi: presaleAbi, data: log.data, topics: log.topics }) as any;
            return {
              addr: (decoded.args?.buyer as string)?.slice(0, 6) ?? '0x????',
              amount: Number(formatUnits((decoded.args?.leviAmount as bigint) ?? BigInt(0), 18)),
              time: i === 0 ? 'just now' : `${i * 3 + 2}m ago`,
            };
          } catch { return null; }
        }).filter(Boolean) as Buyer[];
        setBuyers(recent);
      } catch (err) { console.error("BuyersFeed Error:", err); }
    };
    fetchLogs();
  }, [deployed, publicClient]);

  useWatchContractEvent({
    address: ACTIVE_CONFIG.presaleAddress,
    event: parseAbiItem('event TokensPurchased(address indexed buyer, address indexed payToken, uint256 usdAmount, uint256 leviAmount)'),
    onLogs(rawLogs: any) {
      const newer: Buyer[] = (rawLogs as any[]).map(log => {
        try {
          const decoded = decodeEventLog({ abi: presaleAbi, data: log.data, topics: log.topics }) as any;
          return {
            addr: (decoded.args?.buyer as string)?.slice(0, 6) ?? '0x????',
            amount: Number(formatUnits((decoded.args?.leviAmount as bigint) ?? BigInt(0), 18)),
            time: 'just now',
          };
        } catch { return null; }
      }).filter(Boolean) as Buyer[];
      setBuyers(prev => [...newer, ...prev].slice(0, 5));
    },
    enabled: deployed,
  } as any);

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
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 1 - i * 0.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#10b981' : 'var(--accent-primary)' }} />
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

/* ── FAQ Item ────────────────────────────────────────────── */
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
  const { lang, t } = useLanguage();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [buyAmount, setBuyAmount] = useState('1');

  const dict = useMemo(() => ({
    hero: {
      tag: t('TOKEN-GATED · NATIVE · RESEARCH-DRIVEN', 'トークンゲート · ネイティブ · 研究主導'),
      h1: t('Onchain Intelligence. Built for Tempo.', 'オンチェーン・インテリジェンス。\nTempoのために。'),
      cta_connect: t('Connect Wallet', 'ウォレット接続'),
      cta_switch: t('Switch to Tempo', 'Tempoに切替'),
      cta_join: t('Join Presale →', 'プレセールに参加 →'),
    },
    stats: {
      price: t('Token Price', '現在の価格'),
      rate: t('Rate', 'レート'),
      sold: t('Tokens Sold', '販売済み'),
      raised: t('USD Raised', '調達額'),
    },
    about: {
      label: t('CAPABILITIES', '機能・特性'),
      h2: t('What LEVI ', 'LEVIの'),
      h2_span: t('Can Do', '能力'),
      cards: [
        { title: t('Autonomous Research Layer', '自律型リサーチ・レイヤー'), body: t('LEVI continuously monitors and processes onchain activity, providing real-time insights without manual tracking.', 'LEVIは常にオンチェーン・アクティビティを監視・処理し、手動の追跡なしでリアルタイムの洞察を提供します。'), label: t('AUTONOMOUS', '自律型') },
        { title: t('Intelligence, Not Just Data', '単なるデータを超える知能'), body: t('LEVI identifies patterns like accumulation and liquidity shifts to provide meaningful, actionable insights.', 'LEVIは蓄積や流動性の変化などのパターンを特定し、意味のある実用的なインサイトを提供します。'), label: t('INTELLIGENCE', '知力') },
        { title: t('Token-Gated Access System', 'トークンゲート・アクセス'), body: t('Only holders above a threshold can access LEVI, ensuring terminal performance and high-quality usage.', '一定量以上の保有者のみがLEVIにアクセスでき、ターミナルの性能と高品質な利用を保証します。'), label: t('NATIVE', 'ネイティブ') },
        { title: t('Built on Tempo Chain', 'Tempoチェーン上に構築'), body: t('LEVI operates natively on Tempo, enabling efficient, near-zero fee, and low-cost real-time interactions.', 'LEVIはTempo上でネイティブに動作し、効率的でガス代ほぼゼロのリアルタイムな対話を可能にします。'), label: t('TEMPO NATIVE', 'Tempoネイティブ') },
      ]
    },
    how: {
      label: t('PROCESS', 'プロセス'),
      h2: t('How To ', '購入'),
      h2_span: t('Buy', 'の流れ'),
      steps: [
        { title: t('Connect Your Wallet', 'ウォレットを接続'), body: t('Click "Connect Wallet" and link any EVM-compatible wallet (MetaMask, Rabby etc.) to the Tempo Testnet.', '「ウォレット接続」をクリックし、MetaMaskなどのEVM対応ウォレットをTempo Testnetにリンクします。') },
        { title: t('Choose Amount & Token', '通貨と金額を選択'), body: t('Enter $1–$100 or download "skill.md" from the terminal to let your AI agent buy for you autonomously.', '$1〜$100の範囲で入力するか、ターミナルから「skill.md」をダウンロードしてAIエージェントに自律購入させます。') },
        { title: t('Receive $LEVI', '$LEVIを受け取る'), body: t('$LEVI lands in your wallet instantly at a fixed rate. No slippage. No tricks.', '$LEVIは固定レートで即座にウォレットに届きます。スリッページや不透明な操作はありません。') },
      ]
    },
    buy: {
      title: t('Buy $LEVI', '$LEVI を購入'),
      subtitle: t('FAIR MINT · FIXED SUPPLY', 'フェアミント · 固定供給'),
      pay: t('You Pay', '支払額'),
      receive: t('You Receive', '受取額'),
      progress: t('Presale Progress', 'プレセール進捗'),
      btn_approve: t('Step 1: Approve', '手順 1: 承認'),
      btn_buying: t('Step 2: Buy', '手順 2: 購入'),
      status_buy_now: t('Buy $LEVI →', '$LEVI を購入 →'),
      status_wrong_net: t('⚡ Switch to Tempo', '⚡ Tempoに切替'),
    },
    tokenomics: {
      label: t('DISTRIBUTION', 'トークン配分'),
      title: t('Tokenomics', 'トケノミクス'),
      chart: [
        { label: t('Public Presale', '一般プレセール'), sub: t('50M LEVI', '5,000万 LEVI') },
        { label: t('Liquidity (Locked)', '流動性（ロック）'), sub: t('30M LEVI', '3,000万 LEVI') },
        { label: t('Ecosystem Growth', 'エコシステム成長'), sub: t('10M LEVI', '1,000万 LEVI') },
        { label: t('Staking & Rewards', 'ステーキング報酬'), sub: t('10M LEVI', '1,000万 LEVI') },
      ],
      notice: t('No team allocation · No insider tokens', 'チーム配分なし · インサイダー保有なし')
    },
    faq: {
      label: t('QUESTIONS', 'よくある質問'),
      title: t('FAQ', 'FAQ'),
      items: [
        { q: t('What is LEVI?', 'LEVIとは何ですか？'), a: t('LEVI is an AI-powered research agent built for the Tempo network. It analyzes onchain activity and converts raw data into actionable insights.', 'LEVIはTempoネットワーク向けに構築されたAI駆動型のリサーチエージェントです。オンチェーン・アクティビティを分析し、生データを実用的な洞察に変換します。') },
        { q: t('What is the implied valuation (FDV)?', '想定時価総額（FDV）はいくらですか？'), a: t('At the presale rate of $1 per 2,000 tokens ($0.0005 per LEVI), the implied Fully Diluted Valuation (FDV) is $50,000, based on the fixed total supply of 100,000,000 tokens.', 'プレセールレートの1ドルあたり2,000トークン（1 LEVI = 0.0005ドル）の場合、想定時価総額（FDV）は、固定された総供給量1億トークンに基づき50,000ドルとなります。') },
        { q: t('What is the Tempo Network?', 'Tempoネットワークとは何ですか？'), a: t('Tempo is an EVM-compatible Layer 1 blockchain designed for fast and low-cost transactions. LEVI is built natively on it for real-time analysis.', 'Tempoは高速かつ低コストな取引を実現するために設計されたEVM互換のレイヤー1ブロックチェーンです。LEVIはリアルタイム分析のためにその上でネイティブに構築されています。') },
        { q: t('How do I participate in the presale?', 'プレセールへの参加方法は？'), a: t('Connect your wallet via the official platform and contribute using supported assets like pathUSD or AlphaUSD.', '公式プラットフォーム経由でウォレットを接続し、pathUSDやAlphaUSDなどのサポートされている資産を使用して参加します。') },
        { q: t('Is there a limit on purchase?', '購入制限はありますか？'), a: t('Yes. To ensure fair distribution, individual contributions are currently capped at $100 per wallet during the testnet phase.', 'はい。公平な分配を期すため、テストネット段階では1ウォレットあたり100ドルを上限としています。') },
        { q: t('Is the research exclusive to holders?', 'リサーチは保有者限定ですか？'), a: t('Yes. Access to the full Intelligence Terminal is token-gated. A minimum $LEVI balance is required.', 'はい。インテリジェンス・ターミナルの全機能へのアクセスはトークンで制限されており、最低限の$LEVI保有が必要です。') },
        { q: t('What is the total supply of $LEVI?', 'LEVIの総供給量は？'), a: t('The total supply is fixed at 100,000,000 (100 Million) tokens. No additional tokens can ever be minted.', '総供給量は1億枚（100,000,000 LEVI）に固定されており、追加発行は一切行われません。') },
        { q: t('Does LEVI support other chains?', '他のチェーンもサポートしていますか？'), a: t('LEVI is optimized for Tempo, but cross-chain data ingestion for a broader research scope is on our roadmap.', 'LEVIはTempo向けに最適化されていますが、より広範なリサーチのためのクロスチェーンデータ取り込みもロードマップに含まれています。') },
        { q: t('What happens after the presale?', 'プレセール後はどうなりますか？'), a: t('The roadmap includes token launch, liquidity deployment, and phased access rollout for the research engine.', 'トークンのローンチ、流動性の展開、およびリサーチエンジンの段階的なアクセス開始が予定されています。') },
      ]
    },
    tickers: [
      t('ON-CHAIN RESEARCH', 'オンチェーン・リサーチ'),
      t('REAL-TIME INTELLIGENCE', 'リアルタイム・インテリジェンス'),
      t('TOKEN-GATED', 'トークンゲート'),
      t('TEMPO NATIVE', 'Tempoネイティブ'),
      t('AI INSIGHTS', 'AIインサイト'),
      t('FAIR MINT', 'フェアミント'),
      t('FIXED SUPPLY', '固定供給'),
      t('BUILT FOR RESEARCH', 'リサーチ特化設計'),
    ],
    footer: {
      copyright: t('© 2026 LEVI Protocol · Built on Tempo Network', '© 2026 LEVI プロトコル · Tempoネットワーク上に構築'),
    },
    admin: {
      title: t('Admin Suite', '管理スイート'),
      burn: t('Burn LEVI (Manual)', 'LEVIを手動でバーン'),
    }
  }), [t]);

  const [selectedToken, setSelectedToken] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [buyStep, setBuyStep] = useState<'idle' | 'approving' | 'buying' | 'admin'>('idle');

  useEffect(() => { setMounted(true); }, []);
  useReveal([lang, mounted]);
  const pendingToastId = useRef<number | null>(null);

  const deployed = isDeployed();
  const ZERO = BigInt(0);
  const targetChainId = ACTIVE_NETWORK === 'testnet' ? NETWORKS.testnet.chainId : NETWORKS.mainnet.chainId;
  const wrongNetwork = mounted && isConnected && chainId !== targetChainId;

  const { data: contractData, isLoading, refetch: refetchStats } = useReadContracts({
    contracts: deployed ? [
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'totalSold' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'totalRaised' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'tokensPerUsdc' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'presaleAllocation' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'presaleActive' },
      { address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'owner' },
    ] : [],
    query: { refetchInterval: 5000 }
  });

  const token = ACTIVE_TOKENS[selectedToken];
  const usdAmount = parseFloat(buyAmount || '0');
  const safeUsd = isNaN(usdAmount) || usdAmount <= 0 ? 0 : Math.min(usdAmount, 100);
  const usdBigInt = mounted ? parseUnits(String(safeUsd), 6) : ZERO;

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    ...(mounted && isConnected && deployed ? {
      address: token.address, abi: erc20Abi, functionName: 'allowance',
      args: [address!, ACTIVE_CONFIG.presaleAddress],
    } : { address: token.address, abi: erc20Abi, functionName: 'allowance', args: ['0x0000000000000000000000000000000000000000' as `0x${string}`, ACTIVE_CONFIG.presaleAddress] }),
    query: { refetchInterval: 5000 }
  });
  const allowance = (allowanceRaw as bigint | undefined) ?? ZERO;
  const needsApprove = allowance < usdBigInt;

  const { writeContract, data: txHash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeError) {
      toast(writeError.message.slice(0, 80), 'error');
      setBuyStep('idle');
      resetWrite();
    }
  }, [writeError, resetWrite]);

  useEffect(() => {
    if (isConfirmed) {
      if (buyStep === 'approving') {
        if (pendingToastId.current) dismiss(pendingToastId.current);
        toast(t('Token approved!', '承認完了！'), 'success');
        setBuyStep('idle');
        resetWrite();
        refetchAllowance();
      } else if (buyStep === 'buying') {
        if (pendingToastId.current) dismiss(pendingToastId.current);
        toast(`🎉 ${t('Successfully bought $LEVI!', '購入完了！')}`, 'success');
        setBuyStep('idle');
        resetWrite();
        refetchStats();
      } else if (buyStep === 'admin') {
        if (pendingToastId.current) dismiss(pendingToastId.current);
        toast(`Universal time synced!`, 'success');
        setBuyStep('idle');
        resetWrite();
        refetchStartTime();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  const handleBuy = useCallback(() => {
    if (!isConnected) { connect({ connector: injected() }); return; }
    if (wrongNetwork) { switchChain({ chainId: targetChainId }); return; }
    if (usdAmount < 1 || usdAmount > 100) { toast('Min $1, Max $100', 'error'); return; }
    if (pendingToastId.current) dismiss(pendingToastId.current);
    if (needsApprove) {
      setBuyStep('approving');
      pendingToastId.current = toast(t('Approving...', '承認中...'), 'pending');
      writeContract({ address: token.address, abi: erc20Abi, functionName: 'approve', args: [ACTIVE_CONFIG.presaleAddress, maxUint256] });
    } else {
      setBuyStep('buying');
      pendingToastId.current = toast(t('Buying...', '購入中...'), 'pending');
      writeContract({ address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'buyTokens', args: [token.address, usdBigInt] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, wrongNetwork, usdAmount, needsApprove, token, usdBigInt]);

  const totalSoldRaw = (contractData?.[0]?.result ?? ZERO) as bigint;
  const totalRaisedRaw = (contractData?.[1]?.result ?? ZERO) as bigint;
  const tokensPerUsdcRaw = (contractData?.[2]?.result ?? ZERO) as bigint;
  const presaleAllocRaw = (contractData?.[3]?.result ?? ZERO) as bigint;
  const presaleActive = (contractData?.[4]?.result ?? false) as boolean;
  const contractOwner = (contractData?.[5]?.result ?? '') as string;
  const SUPER_ADMIN = "0x814048a6035015E9f3ee32c1715202f54360a215";

  const [isAdmin, setIsAdmin] = useState(false);
  const [showKintsugi, setShowKintsugi] = useState(false);
  const [showHanko, setShowHanko] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  const { data: presaleStartTime, refetch: refetchStartTime } = useReadContract({
    address: ACTIVE_CONFIG.presaleAddress,
    abi: presaleAbi,
    functionName: 'presaleStartTime',
    query: { enabled: mounted && deployed }
  });

  const targetTime = useMemo(() => {
    return presaleStartTime ? Number(presaleStartTime) * 1000 : 0;
  }, [presaleStartTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  const isLocked = targetTime > Date.now();

  useEffect(() => {
    if (mounted && isConnected && address) {
      const isOwner = contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
      const isSuper = address.toLowerCase() === SUPER_ADMIN.toLowerCase();
      setIsAdmin(isOwner || isSuper);
    }
  }, [mounted, isConnected, address, contractOwner]);

  useEffect(() => {
    if (isConnected) {
      setShowKintsugi(true);
      const timer = setTimeout(() => setShowKintsugi(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConfirmed && buyStep === 'buying') {
      setShowHanko(true);
      const timer = setTimeout(() => setShowHanko(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, buyStep]);

  const totalSold = Number(formatUnits(totalSoldRaw, 18));
  const totalRaised = Number(formatUnits(totalRaisedRaw, 6));
  const tokensPerUsdc = Number(tokensPerUsdcRaw) || 2000;
  const presaleAlloc = Number(formatUnits(presaleAllocRaw, 18)) || 50000000;
  const progress = presaleAlloc > 0 ? (totalSold / presaleAlloc) * 100 : 0;
  const price = tokensPerUsdc > 0 ? 1 / tokensPerUsdc : 0.0005;
  const leviOut = usdAmount * tokensPerUsdc;

  const handleWithdrawFunds = useCallback(async () => {
    if (!isAdmin) return;
    for (const t of ACTIVE_TOKENS) {
      writeContract({ address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'withdrawToken', args: [t.address] });
    }
  }, [isAdmin, writeContract]);

  const handleWithdrawLevi = useCallback(() => {
    if (!isAdmin) return;
    writeContract({ address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'withdrawToken', args: [ACTIVE_CONFIG.tokenAddress] });
  }, [isAdmin, writeContract]);

  const handleSetRate = useCallback(() => {
    if (!isAdmin) return;
    const rate = prompt("Enter new tokens per USD (e.g. 2000):");
    if (!rate || isNaN(Number(rate))) return;
    writeContract({ address: ACTIVE_CONFIG.presaleAddress, abi: presaleAbi, functionName: 'setTokensPerUsdc', args: [BigInt(rate)] });
  }, [isAdmin, writeContract]);

  const handleBurn = useCallback(() => {
    if (!isAdmin) return;
    const amount = prompt("LEVI to burn from your wallet:");
    if (!amount || isNaN(Number(amount))) return;
    writeContract({
      address: ACTIVE_CONFIG.tokenAddress,
      abi: [{ inputs: [{ name: 'amount', type: 'uint256' }], name: 'burn', outputs: [], stateMutability: 'nonpayable', type: 'function' }],
      functionName: 'burn',
      args: [parseUnits(amount, 18)]
    });
  }, [isAdmin, writeContract]);

  const handleSetCountdown = useCallback(() => {
    if (!isAdmin) return;
    const mins = prompt("Minutes until presale starts (0 to disable):");
    if (mins === null) return;
    const target = mins === '0' ? BigInt(0) : BigInt(Math.floor(Date.now() / 1000) + parseInt(mins) * 60);
    setBuyStep('admin');
    pendingToastId.current = toast(`Syncing time with network...`, 'pending');
    writeContract({
      address: ACTIVE_CONFIG.presaleAddress,
      abi: presaleAbi,
      functionName: 'setPresaleStartTime',
      args: [target]
    });
  }, [isAdmin, writeContract]);

  const animatedSold = useCountUp(totalSold, 1400, deployed && !isLoading);
  const animatedRaised = useCountUp(totalRaised, 1400, deployed && !isLoading);
  const networkLabel = ACTIVE_NETWORK === 'testnet' ? 'Tempo Testnet' : 'Tempo Mainnet';
  const tickers = dict.tickers;
  const isBusy = isPending || isConfirming || buyStep !== 'idle';
  const btnLabel = !mounted || !isConnected ? dict.hero.cta_connect : wrongNetwork ? dict.buy.status_wrong_net : isBusy ? t('Processing...', '処理中...') : needsApprove ? t('Approve', '承認') : dict.buy.status_buy_now;
  const btnDisabled = mounted && (deployed && (!presaleActive || isBusy) && isConnected && !wrongNetwork);

  return (
    <main className={lang === 'ja' ? 'lang-ja' : ''}>
      <ToastContainer />

      {/* ── KINTSUGI OVERLAY ────────────────────────── */}
      {showKintsugi && (
        <div className="kintsugi-vessel">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="kintsugi-crack" d="M0,20 Q30,50 50,20 T100,60" />
            <path className="kintsugi-crack" d="M20,0 Q50,40 20,60 T70,100" style={{ animationDelay: '0.2s' }} />
            <path className="kintsugi-crack" d="M100,10 Q60,40 80,70 T30,100" style={{ animationDelay: '0.4s' }} />
          </svg>
        </div>
      )}

      {/* ── HANKO STAMP ────────────────────────────── */}
      {showHanko && (
        <div className="hanko-container">
          <div className="hanko-stamp">
            <div className="hanko-border">
              <span className="hanko-text">完</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SHIORI SIDEBAR ──────────────────────────── */}
      <div className="shiori-container">
        <a href="#about" className="shiori">{t('Capabilities', '機能特性')}</a>
        <a href="#how" className="shiori">{t('Process', '購入手順')}</a>
        <a href="#presale" className="shiori active">{t('Presale', 'プレセール')}</a>
      </div>

      {termOpen && <LeviTerminal onClose={() => setTermOpen(false)} />}

      <button onClick={() => setTermOpen(true)} className="levi-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
        <span>LEVI</span>
        <span className="levi-btn-dot" />
      </button>

      <div className="marquee-wrapper" style={{ marginTop: 72 }}>
        <div className="marquee-track">
          {[...tickers, ...tickers].map((item, i) => (
            <div key={i} className="marquee-item"><span className="marquee-dot" /><span>{item}</span></div>
          ))}
        </div>
      </div>

      {/* ── HERO SHAPE ── */}
      <section id="home" className="container" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="animate-drift" style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
          <div className="animate-drift" style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)', bottom: '-10%', right: '-10%', filter: 'blur(80px)', animationDelay: '-4s' }} />
        </div>

        <div className="reveal">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 20px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 40, backdropFilter: 'blur(12px)', marginBottom: 24 }}>
            <span className="jetbrains" style={{ fontSize: '0.7rem', letterSpacing: 4, color: '#3b82f6', fontWeight: 700 }}>{dict.hero.tag}</span>
          </div>
          <h1 className="noto shimmer-text animate-pulse-glow" style={{ fontSize: 'clamp(3rem, 10vw, 6.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 40, whiteSpace: 'pre-line', letterSpacing: '-0.04em' }}>{dict.hero.h1}</h1>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            {!mounted || !isConnected ? (
              <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }} onClick={() => connect({ connector: injected() })}>{dict.hero.cta_connect}</button>
            ) : wrongNetwork ? (
              <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }} onClick={() => switchChain({ chainId: targetChainId })}>{dict.buy.status_wrong_net}</button>
            ) : (
              <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.05rem' }} onClick={() => disconnect()}>🟢 {address?.slice(0, 6)}…{address?.slice(-4)}</button>
            )}
            <a href="#presale" className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.05rem', textDecoration: 'none' }}>{dict.hero.cta_join}</a>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', width: '100%', maxWidth: 900, margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', padding: '12px' }}>
            {[
              { label: dict.stats.price, value: deployed && !isLoading ? `$${price.toFixed(6)}` : '$—', accent: 'var(--accent-primary)' },
              { label: dict.stats.rate, value: deployed && !isLoading ? `${fmt(tokensPerUsdc)} / USD` : '—', accent: 'var(--accent-secondary)' },
              { label: dict.stats.sold, value: deployed && !isLoading ? fmt(animatedSold) : '0', accent: 'var(--text-primary)' },
              { label: dict.stats.raised, value: deployed && !isLoading ? `$${animatedRaised.toFixed(2)}` : '$0.00', accent: 'var(--text-primary)' },
            ].map(({ label, value, accent }, i) => (
              <div key={label} style={{ flex: '1 1 25%', padding: '28px 20px', borderRight: i < 3 ? '1px solid var(--glass-border)' : 'none', minWidth: '150px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
                <div className="jetbrains" style={{ fontSize: '1.2rem', fontWeight: 800, color: accent }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────── */}
      <section id="about" style={{ padding: '100px 0', background: 'rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">{dict.about.label}</div>
            <h2 className="noto" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>{dict.about.h2} <span className="text-azure">{dict.about.h2_span}</span></h2>
          </div>
          <div className="grid-2">
            {dict.about.cards.map(({ label, title, body }, idx) => (
              <div key={title} className={`reveal reveal-delay-${idx + 1} glass-card-hover glass-panel`} style={{ padding: '36px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div className="jetbrains" style={{ fontSize: '0.62rem', letterSpacing: 3, color: 'var(--accent-primary)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '4px 10px', borderRadius: 20 }}>{label}</div>
                </div>
                <h3 className="noto" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.9rem' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW ── */}
      <section id="how" style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">{dict.how.label}</div>
            <h2 className="noto" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700 }}>{dict.how.h2} <span className="text-gradient">{dict.how.h2_span}</span></h2>
          </div>
          <div className="grid-3">
            {dict.how.steps.map(({ title, body }, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} glass-panel`} style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>
                <div className="step-number" style={{ width: 60, height: 60, fontSize: '1.2rem' }}>0{i + 1}</div>
                <div><h3 className="noto" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>{title}</h3><p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESALE ───────────────────────────────────── */}
      <section id="presale" className="container" style={{ padding: '100px 0' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ color: 'var(--accent-primary)' }}>{presaleActive ? '● PRESALE IS LIVE' : '◌ PRESALE STARTING'}</div>
          <h2 className="noto" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700 }}>Buy <span className="text-gradient">$LEVI</span></h2>
        </div>

        <div className="presale-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 32, maxWidth: 1050, margin: '0 auto' }}>

          <div className="reveal-left glass-panel glass-glow" style={{
            padding: isLocked ? '40px' : '28px',
            position: 'relative',
            border: '0.5px solid rgba(255,255,255,0.15)',
            background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {isLocked ? (
              <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 40 }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: 4, color: '#3b82f6', marginBottom: 24 }}>LOCKED · 封印</div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
                  {[
                    { val: timeLeft.h, label: 'H' },
                    { val: timeLeft.m, label: 'M' },
                    { val: timeLeft.s, label: 'S' }
                  ].map((t, i) => (
                    <div key={i} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                      <div className="jetbrains" style={{ fontSize: '2rem', fontWeight: 800 }}>{t.val.toString().padStart(2, '0')}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
                <p className="noto" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The terminal is preparing for autonomous synchronization.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateRows: '1fr', overflow: 'hidden', animation: 'unroll 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <div>
                  {/* Payment selection */}
                  <div style={{ marginBottom: 20 }}>
                    <div className="section-label" style={{ marginBottom: 10, fontSize: '0.55rem' }}>{dict.buy.pay}</div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                      {ACTIVE_TOKENS.map((t, i) => (
                        <button key={t.symbol} onClick={() => setSelectedToken(i)} style={{
                          flex: 1, padding: '10px', borderRadius: 8, border: '0.5px solid',
                          background: selectedToken === i ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                          borderColor: selectedToken === i ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                          color: selectedToken === i ? 'white' : 'var(--text-muted)',
                          fontSize: '0.75rem', fontWeight: selectedToken === i ? 700 : 400,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                          {t.symbol}
                        </button>
                      ))}
                    </div>
                    <div className="input-container" style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                      <input type="number" className="input-field-borderless" style={{ fontSize: '1.6rem', fontWeight: 700, flex: 1 }} value={buyAmount} onChange={e => setBuyAmount(e.target.value)} />
                      <span className="jetbrains" style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 700 }}>{token.symbol}</span>
                    </div>
                  </div>

                  <div className="swap-icon-wrapper" style={{ margin: '-14px 0', zIndex: 1 }}><div className="swap-icon" style={{ background: '#3b82f6', color: 'white', width: 30, height: 30, fontSize: '0.75rem', border: 'none' }}>↓</div></div>

                  <div style={{ marginBottom: 28, marginTop: 4 }}>
                    <div className="section-label" style={{ marginBottom: 10, fontSize: '0.55rem' }}>{dict.buy.receive}</div>
                    <div className="input-container readonly" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.03)', border: '0.5px solid rgba(59,130,246,0.2)' }}>
                      <div className="jetbrains text-gradient" style={{ fontSize: '1.6rem', fontWeight: 700, flex: 1 }}>{fmt(leviOut)}</div>
                      <span className="token-badge levi" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>⬡ LEVI</span>
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: 8 }}>{deployed && tokensPerUsdc > 0 ? `1 USD = ${fmt(tokensPerUsdc)} LEVI` : '—'}</div>
                  </div>

                  <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '0.95rem', borderRadius: 12 }} onClick={handleBuy} disabled={!!btnDisabled}>{btnLabel}</button>
                </div>
              </div>
            )}
          </div>

          <div className="reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>{dict.buy.progress}</div>
              <div style={{ height: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>{fmt(totalSold)} LEVI</span><span>{progress.toFixed(1)}%</span>
              </div>
            </div>
            <BuyersFeed deployed={deployed} />
          </div>
        </div>
      </section>

      {/* ── TOKENOMICS & FAQ ────────────────────────── */}
      <section id="tokenomics" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">{dict.tokenomics.label}</div>
            <h2 className="noto" style={{ fontSize: '2rem', fontWeight: 700 }}>{dict.tokenomics.title}</h2>
          </div>
          <DonutChart dict={dict} />
        </div>
      </section>

      <section style={{ padding: '100px 0 150px' }}>
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">{dict.faq.label}</div>
            <h2 className="noto" style={{ fontSize: '3rem', fontWeight: 700 }}>{dict.faq.title}</h2>
          </div>
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 850, margin: '0 auto' }}>
            {dict.faq.items.map((item, idx) => (
              <FaqItem key={idx} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '80px 0 40px', background: 'rgba(0,0,0,0.3)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="text-gradient jetbrains" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 20 }}>LEVI</div>
          <div style={{ display: 'flex', gap: 30, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
            <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
            <a href="https://x.com/levilabstempo" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Twitter</a>
            <a href="https://moderato.tempo.xyz" target="_blank" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Tempo Explorer</a>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: 1 }}>{dict.footer.copyright}</p>
        </div>
      </footer>

      {isAdmin && (
        <section id="admin" style={{ padding: '100px 0', background: 'rgba(0,0,0,0.8)', borderTop: '1px solid #3b82f633' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="section-label" style={{ color: '#3b82f6' }}>OWNER ONLY</div>
              <h2 className="jetbrains" style={{ fontSize: '2rem', fontWeight: 900 }}>{dict.admin.title}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 16 }}>COLLECT STABLES</div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={handleWithdrawFunds}>Withdraw USD</button>
              </div>

              <div className="glass-panel" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 16 }}>RECOVER UNSOLD</div>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={handleWithdrawLevi}>Withdraw LEVI</button>
              </div>

              <div className="glass-panel" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 16 }}>ADJUST PRICING</div>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={handleSetRate}>Set Token Rate</button>
              </div>

              <div className="glass-panel" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 16 }}>PRESALE TIMER</div>
                <button className="btn-secondary" style={{ width: '100%', borderColor: '#3b82f633' }} onClick={handleSetCountdown}>Set Target Time</button>
              </div>

              <div className="glass-panel" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 16 }}>SUPPLY CONTROL</div>
                <button className="btn-secondary" style={{ width: '100%', borderColor: '#ef444433', color: '#ef4444' }} onClick={handleBurn}>{dict.admin.burn}</button>
              </div>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
