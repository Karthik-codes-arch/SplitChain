// src/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import SendAlgo from './components/SendAlgo'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [sendAlgoModal, setSendAlgoModal] = useState<boolean>(false)
  const [bills, setBills] = useState<any[]>([])
  const [showCreateBill, setShowCreateBill] = useState<boolean>(false)
  const [billName, setBillName] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState<string>('')
  const [members, setMembers] = useState<{ name: string; address: string; share: string; paid: boolean }[]>([
    { name: '', address: '', share: '', paid: false },
  ])
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const addMember = () => {
    setMembers([...members, { name: '', address: '', share: '', paid: false }])
  }

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const createBill = () => {
    if (!billName || !totalAmount) return
    const newBill = {
      id: Date.now(),
      name: billName,
      total: totalAmount,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      members: members.filter((m) => m.address !== ''),
    }
    setBills([...bills, newBill])
    setBillName('')
    setTotalAmount('')
    setMembers([{ name: '', address: '', share: '', paid: false }])
    setShowCreateBill(false)
  }

  const markPaid = (billId: number, memberIndex: number) => {
    setSendAlgoModal(true)
    setBills(bills.map((bill) => {
      if (bill.id === billId) {
        const updatedMembers = [...bill.members]
        updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], paid: true }
        return { ...bill, members: updatedMembers }
      }
      return bill
    }))
  }

  const totalPaid = (bill: any) => bill.members.filter((m: any) => m.paid).length
  const totalMembers = (bill: any) => bill.members.length

  const pendingBills = bills.filter(b => !b.members.every((m: any) => m.paid) || b.members.length === 0)
  const settledBills = bills.filter(b => b.members.every((m: any) => m.paid) && b.members.length > 0)

  const renderBillCard = (bill: any, showActions: boolean) => {
    const paidCount = totalPaid(bill)
    const memberCount = totalMembers(bill)
    const progress = memberCount > 0 ? (paidCount / memberCount) * 100 : 0
    const isSettled = paidCount === memberCount && memberCount > 0

    return (
      <div key={bill.id} className="sc-bill-card" style={isSettled ? { borderColor: 'rgba(0,200,150,0.2)' } : {}}>
        <div className="sc-bill-header">
          <div>
            <div className="sc-bill-name">{bill.name}</div>
            <div className="sc-bill-date">{bill.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="sc-bill-amount">{bill.total} ALGO</div>
            <div className="sc-bill-amount-label">Total</div>
          </div>
        </div>

        <div className="sc-progress-bar">
          <div className="sc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="sc-progress-text">
          {paidCount} of {memberCount} paid · {progress.toFixed(0)}% settled
        </div>

        {showActions && (
          <table className="sc-member-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bill.members.map((member: any, index: number) => (
                <tr key={index}>
                  <td>
                    <span className="sc-member-name">{member.name || 'Member ' + (index + 1)}</span>
                    <span className="sc-member-addr">
                      {member.address ? member.address.slice(0, 10) + '...' + member.address.slice(-6) : '—'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: '#f0ede8' }}>{member.share} ALGO</td>
                  <td>
                    {member.paid
                      ? <span className="sc-badge-paid">✓ Paid</span>
                      : <span className="sc-badge-pending">⏳ Pending</span>
                    }
                  </td>
                  <td>
                    {!member.paid && (
                      <button className="sc-pay-btn" onClick={() => markPaid(bill.id, index)}>
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isSettled && (
          <div className="sc-settled-banner">
            ✓ Bill fully settled — all payments confirmed on Algorand
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; }

        .sc-root {
          min-height: 100vh;
          background: #0a0a0f;
          color: #f0ede8;
          position: relative;
          overflow-x: hidden;
        }

        .sc-bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .sc-bg-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%);
          top: -200px; right: -200px;
        }

        .sc-bg-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(100,80,255,0.08) 0%, transparent 70%);
          bottom: 100px; left: -150px;
        }

        .sc-content { position: relative; z-index: 1; }

        .sc-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10,10,15,0.8);
        }

        .sc-logo {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sc-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #00c896, #00a8ff);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .sc-logo span { color: #00c896; }

        .sc-wallet-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 22px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #f0ede8;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sc-wallet-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }

        .sc-wallet-btn.connected {
          border-color: rgba(0,200,150,0.4);
          background: rgba(0,200,150,0.08);
          color: #00c896;
        }

        .sc-wallet-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #00c896;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .sc-hero {
          text-align: center;
          padding: 80px 40px 60px;
          max-width: 700px;
          margin: 0 auto;
        }

        .sc-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(0,200,150,0.3);
          background: rgba(0,200,150,0.08);
          color: #00c896;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .sc-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: #fff;
          margin-bottom: 20px;
        }

        .sc-hero h1 span {
          background: linear-gradient(135deg, #00c896, #00a8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sc-hero p {
          font-size: 17px;
          color: rgba(240,237,232,0.5);
          line-height: 1.7;
          font-weight: 300;
        }

        .sc-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          padding: 40px;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 60px;
        }

        .sc-stat { text-align: center; }

        .sc-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .sc-stat-label {
          font-size: 13px;
          color: rgba(240,237,232,0.4);
          margin-top: 4px;
          font-weight: 300;
        }

        .sc-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 60px;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 24px;
        }

        .sc-feature-card {
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }

        .sc-feature-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-bottom: 14px;
        }

        .sc-feature-icon.green { background: rgba(0,200,150,0.1); }
        .sc-feature-icon.blue { background: rgba(0,168,255,0.1); }
        .sc-feature-icon.purple { background: rgba(130,100,255,0.1); }

        .sc-feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .sc-feature-desc {
          font-size: 13px;
          color: rgba(240,237,232,0.35);
          line-height: 1.6;
          font-weight: 300;
        }

        .sc-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .sc-create-bill-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
          gap: 12px;
        }

        .sc-cta-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          padding: 14px 32px;
          border-radius: 100px;
          border: none;
          background: linear-gradient(135deg, #00c896, #00a8ff);
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 40px rgba(0,200,150,0.25);
        }

        .sc-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 60px rgba(0,200,150,0.4);
        }

        .sc-cta-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .sc-form-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
        }

        .sc-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sc-input-group { margin-bottom: 18px; }

        .sc-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(240,237,232,0.4);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .sc-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #f0ede8;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }

        .sc-input:focus {
          border-color: rgba(0,200,150,0.4);
          background: rgba(0,200,150,0.04);
        }

        .sc-input::placeholder { color: rgba(240,237,232,0.2); }

        .sc-member-row {
          display: grid;
          grid-template-columns: 1fr 1fr 100px 36px;
          gap: 10px;
          margin-bottom: 10px;
          align-items: center;
        }

        .sc-remove-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,80,80,0.2);
          background: rgba(255,80,80,0.05);
          color: rgba(255,100,100,0.7);
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .sc-remove-btn:hover {
          background: rgba(255,80,80,0.15);
          color: #ff6464;
        }

        .sc-add-member-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 9px 16px;
          border-radius: 10px;
          border: 1px dashed rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(240,237,232,0.4);
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }

        .sc-add-member-btn:hover {
          border-color: rgba(0,200,150,0.3);
          color: #00c896;
        }

        .sc-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }

        .sc-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: rgba(240,237,232,0.3);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
        }

        .sc-bill-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .sc-bill-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
        }

        .sc-bill-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .sc-bill-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .sc-bill-date {
          font-size: 12px;
          color: rgba(240,237,232,0.3);
          margin-top: 4px;
          font-weight: 300;
        }

        .sc-bill-amount {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #00c896;
        }

        .sc-bill-amount-label {
          font-size: 11px;
          color: rgba(0,200,150,0.5);
          text-align: right;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sc-progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .sc-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00c896, #00a8ff);
          border-radius: 100px;
          transition: width 0.5s ease;
        }

        .sc-progress-text {
          font-size: 12px;
          color: rgba(240,237,232,0.3);
          margin-bottom: 16px;
          font-weight: 300;
        }

        .sc-member-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sc-member-table th {
          font-size: 11px;
          font-weight: 500;
          color: rgba(240,237,232,0.25);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 0 0 10px 0;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .sc-member-table th:last-child { text-align: right; }

        .sc-member-table td {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 14px;
          color: rgba(240,237,232,0.7);
          vertical-align: middle;
        }

        .sc-member-table tr:last-child td { border-bottom: none; }

        .sc-member-name {
          font-weight: 500;
          color: #f0ede8;
          display: block;
        }

        .sc-member-addr {
          font-size: 11px;
          color: rgba(240,237,232,0.25);
          font-family: monospace;
        }

        .sc-badge-paid {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 100px;
          background: rgba(0,200,150,0.1);
          border: 1px solid rgba(0,200,150,0.2);
          color: #00c896;
          font-size: 12px;
          font-weight: 500;
        }

        .sc-badge-pending {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 100px;
          background: rgba(255,180,0,0.08);
          border: 1px solid rgba(255,180,0,0.2);
          color: #ffb400;
          font-size: 12px;
          font-weight: 500;
        }

        .sc-pay-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid rgba(0,200,150,0.3);
          background: rgba(0,200,150,0.08);
          color: #00c896;
          cursor: pointer;
          transition: all 0.2s;
          float: right;
        }

        .sc-pay-btn:hover {
          background: rgba(0,200,150,0.18);
          border-color: rgba(0,200,150,0.5);
        }

        .sc-settled-banner {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(0,200,150,0.06);
          border: 1px solid rgba(0,200,150,0.15);
          text-align: center;
          font-size: 14px;
          color: #00c896;
          font-weight: 500;
        }

        .sc-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(240,237,232,0.2);
        }

        .sc-empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .sc-empty p { font-size: 15px; font-weight: 300; }

        .sc-connect-prompt {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 20px;
          margin-bottom: 32px;
        }

        .sc-connect-prompt p {
          color: rgba(240,237,232,0.3);
          font-size: 15px;
          font-weight: 300;
          margin-bottom: 20px;
        }

        /* DARK MODAL */
        .modal-box {
          background: #0f0f17 !important;
          color: #f0ede8 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .modal-box h3 { color: #fff !important; font-family: 'Syne', sans-serif !important; }
        .modal-box label { color: rgba(240,237,232,0.5) !important; }
        .modal-box input {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: #f0ede8 !important;
        }
        .modal-box input::placeholder { color: rgba(240,237,232,0.2) !important; }
        .modal-box .btn-primary {
          background: linear-gradient(135deg, #00c896, #00a8ff) !important;
          border: none !important;
        }

        @media (max-width: 768px) {
          .sc-nav { padding: 16px 20px; }
          .sc-hero { padding: 50px 20px 40px; }
          .sc-stats { gap: 30px; flex-wrap: wrap; padding: 24px; }
          .sc-features { grid-template-columns: 1fr; padding: 0 20px; }
          .sc-member-row { grid-template-columns: 1fr 80px 32px; }
        }
      `}</style>

      <div className="sc-root">
        <div className="sc-bg-orb sc-bg-orb-1" />
        <div className="sc-bg-orb sc-bg-orb-2" />

        <div className="sc-content">

          {/* NAV */}
          <nav className="sc-nav">
            <div className="sc-logo">
              <div className="sc-logo-icon">💸</div>
              Split<span>Chain</span>
            </div>
            <button
              className={`sc-wallet-btn ${activeAddress ? 'connected' : ''}`}
              onClick={toggleWalletModal}
            >
              {activeAddress ? (
                <>
                  <div className="sc-wallet-dot" />
                  {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </nav>

          {/* HERO - no button here */}
          <div className="sc-hero">
            <div className="sc-hero-badge">⚡ Powered by Algorand</div>
            <h1>
              Split bills.<br />
              <span>No drama.</span>
            </h1>
            <p>
              Transparent, on-chain group expense settlement.<br />
              Every payment is permanent proof — no more "I forgot".
            </p>
          </div>

          {/* STATS */}
          <div className="sc-stats">
            <div className="sc-stat">
              <div className="sc-stat-num">{bills.length}</div>
              <div className="sc-stat-label">Bills Created</div>
            </div>
            <div className="sc-stat">
              <div className="sc-stat-num">
                {bills.reduce((acc, b) => acc + b.members.filter((m: any) => m.paid).length, 0)}
              </div>
              <div className="sc-stat-label">Payments Settled</div>
            </div>
            <div className="sc-stat">
              <div className="sc-stat-num">
                {bills.reduce((acc, b) => acc + parseFloat(b.total || '0'), 0).toFixed(1)}
              </div>
              <div className="sc-stat-label">ALGO Tracked</div>
            </div>
            <div className="sc-stat">
              <div className="sc-stat-num">~3.5s</div>
              <div className="sc-stat-label">Settlement Speed</div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="sc-features">
            <div className="sc-feature-card">
              <div className="sc-feature-icon green">🔗</div>
              <div className="sc-feature-title">On-Chain Proof</div>
              <div className="sc-feature-desc">Every payment is recorded permanently on Algorand. No disputes, no denials.</div>
            </div>
            <div className="sc-feature-card">
              <div className="sc-feature-icon blue">⚡</div>
              <div className="sc-feature-title">Instant Settlement</div>
              <div className="sc-feature-desc">Algorand confirms transactions in 3.5 seconds. Faster than any bank transfer.</div>
            </div>
            <div className="sc-feature-card">
              <div className="sc-feature-icon purple">👥</div>
              <div className="sc-feature-title">Group Friendly</div>
              <div className="sc-feature-desc">Add unlimited members, assign custom shares, track who's paid in real-time.</div>
            </div>
          </div>

          {/* MAIN */}
          <div className="sc-main">

            {/* CREATE BILL BUTTON — between features and bills */}
            {activeAddress && (
              <div className="sc-create-bill-wrap">
                <button
                  className="sc-cta-btn"
                  onClick={() => setShowCreateBill(!showCreateBill)}
                >
                  {showCreateBill ? '✕ Cancel' : '+ Create New Bill'}
                </button>
              </div>
            )}

            {/* CREATE BILL FORM */}
            {showCreateBill && (
              <div className="sc-form-card">
                <div className="sc-form-title">📋 New Bill</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="sc-input-group">
                    <label className="sc-label">Bill Name</label>
                    <input
                      className="sc-input"
                      placeholder="Bill name"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                    />
                  </div>
                  <div className="sc-input-group">
                    <label className="sc-label">Total Amount (ALGO)</label>
                    <input
                      className="sc-input"
                      placeholder="Amount"
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sc-input-group">
                  <label className="sc-label">Members</label>
                  {members.map((member, index) => (
                    <div key={index} className="sc-member-row">
                      <input
                        className="sc-input"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                      />
                      <input
                        className="sc-input"
                        placeholder="Wallet Address"
                        value={member.address}
                        onChange={(e) => updateMember(index, 'address', e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                      />
                      <input
                        className="sc-input"
                        placeholder="ALGO"
                        type="number"
                        value={member.share}
                        onChange={(e) => updateMember(index, 'share', e.target.value)}
                      />
                      <button
                        className="sc-remove-btn"
                        onClick={() => removeMember(index)}
                        disabled={members.length === 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button className="sc-add-member-btn" onClick={addMember}>
                    + Add Member
                  </button>
                </div>

                <div className="sc-form-actions">
                  <button className="sc-cta-btn" onClick={createBill} disabled={!billName || !totalAmount}>
                    Create Bill
                  </button>
                </div>
              </div>
            )}

            {/* NOT CONNECTED */}
            {!activeAddress && (
              <div className="sc-connect-prompt">
                <p>Connect your Algorand wallet to create and manage bills</p>
                <button className="sc-cta-btn" onClick={toggleWalletModal}>
                  Connect Wallet
                </button>
              </div>
            )}

            {/* PENDING BILLS */}
            {pendingBills.length > 0 && (
              <>
                <div className="sc-section-title">⏳ Pending Bills</div>
                {pendingBills.map((bill) => renderBillCard(bill, true))}
              </>
            )}

            {/* SETTLED BILLS */}
            {settledBills.length > 0 && (
              <>
                <div className="sc-section-title" style={{ marginTop: '40px' }}>✅ Settled Bills</div>
                {settledBills.map((bill) => renderBillCard(bill, false))}
              </>
            )}

            {/* EMPTY STATE */}
            {bills.length === 0 && activeAddress && !showCreateBill && (
              <div className="sc-empty">
                <div className="sc-empty-icon">🧾</div>
                <p>No bills yet. Create your first one above.</p>
              </div>
            )}

          </div>
        </div>

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        <SendAlgo openModal={sendAlgoModal} closeModal={() => setSendAlgoModal(false)} />
      </div>
    </>
  )
}

export default Home