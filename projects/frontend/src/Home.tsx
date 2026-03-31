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
  const [members, setMembers] = useState<{ address: string; share: string; paid: boolean }[]>([
    { address: '', share: '', paid: false },
  ])
  const [payingMember, setPayingMember] = useState<{ address: string; share: string } | null>(null)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const addMember = () => {
    setMembers([...members, { address: '', share: '', paid: false }])
  }

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const createBill = () => {
    if (!billName || !totalAmount) return
    const newBill = {
      id: Date.now(),
      name: billName,
      total: totalAmount,
      members: members.filter((m) => m.address !== ''),
    }
    setBills([...bills, newBill])
    setBillName('')
    setTotalAmount('')
    setMembers([{ address: '', share: '', paid: false }])
    setShowCreateBill(false)
  }

  const handlePay = (billId: number, memberIndex: number, address: string, share: string) => {
    setPayingMember({ address, share })
    setSendAlgoModal(true)
    // Mark as paid after opening modal
    setBills(bills.map((bill) => {
      if (bill.id === billId) {
        const updatedMembers = [...bill.members]
        updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], paid: true }
        return { ...bill, members: updatedMembers }
      }
      return bill
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-teal-400 via-cyan-300 to-sky-400 relative">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">💸 SplitChain</h1>
        <button
          className="btn btn-accent px-5 py-2 text-sm font-medium rounded-full shadow-md"
          onClick={toggleWalletModal}
        >
          {activeAddress ? '✅ Wallet Connected' : 'Connect Wallet'}
        </button>
      </div>

      {/* Hero */}
      <div className="text-center py-8 px-4">
        <h2 className="text-4xl font-extrabold text-white drop-shadow mb-2">Split Bills on Blockchain</h2>
        <p className="text-white/80 text-lg">No more awkward reminders. Transparent, instant, on-chain.</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-12">

        {/* Connect wallet prompt */}
        {!activeAddress && (
          <div className="text-center bg-white/70 rounded-2xl p-6 mb-6 shadow">
            <p className="text-teal-700 font-semibold text-lg">👆 Connect your wallet to get started!</p>
          </div>
        )}

        {/* Create Bill Button */}
        {activeAddress && (
          <div className="flex justify-center mb-6">
            <button
              className="btn btn-primary px-8 py-3 text-lg rounded-full shadow-lg"
              onClick={() => setShowCreateBill(!showCreateBill)}
            >
              {showCreateBill ? '✖ Cancel' : '➕ Create New Bill'}
            </button>
          </div>
        )}

        {/* Create Bill Form */}
        {showCreateBill && (
          <div className="backdrop-blur-md bg-white/80 rounded-2xl p-6 shadow-xl mb-8">
            <h3 className="text-xl font-bold text-teal-700 mb-4">📋 New Bill</h3>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-600">Bill Name</label>
              <input
                className="input input-bordered w-full mt-1"
                placeholder="e.g. Team Dinner"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-600">Total Amount (ALGO)</label>
              <input
                className="input input-bordered w-full mt-1"
                placeholder="e.g. 10"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-600">Members</label>
              {members.map((member, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <input
                    className="input input-bordered flex-1"
                    placeholder="Wallet Address"
                    value={member.address}
                    onChange={(e) => updateMember(index, 'address', e.target.value)}
                  />
                  <input
                    className="input input-bordered w-24"
                    placeholder="ALGO"
                    value={member.share}
                    onChange={(e) => updateMember(index, 'share', e.target.value)}
                  />
                </div>
              ))}
              <button className="btn btn-sm btn-outline mt-2" onClick={addMember}>
                + Add Member
              </button>
            </div>

            <button className="btn btn-success w-full mt-2" onClick={createBill}>
              ✅ Create Bill
            </button>
          </div>
        )}

        {/* Empty state */}
        {bills.length === 0 && activeAddress && !showCreateBill && (
          <div className="text-center bg-white/70 rounded-2xl p-6 shadow">
            <p className="text-gray-500 text-lg">No bills yet. Create your first one! 👆</p>
          </div>
        )}

        {/* Bills List */}
        {bills.map((bill) => (
          <div key={bill.id} className="backdrop-blur-md bg-white/80 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-700">🧾 {bill.name}</h3>
              <span className="badge badge-accent text-white font-bold px-4 py-2">{bill.total} ALGO total</span>
            </div>

            {/* Settlement Status Board */}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-2">Wallet Address</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Status</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {bill.members.map((member: any, index: number) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs text-gray-600 truncate max-w-[180px]">
                      {member.address || 'Unknown'}
                    </td>
                    <td className="py-2 text-right font-semibold">{member.share} ALGO</td>
                    <td className="py-2 text-right">
                      {member.paid ? (
                        <span className="badge badge-success text-white">✅ Paid</span>
                      ) : (
                        <span className="badge badge-error text-white">❌ Pending</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {!member.paid && (
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => handlePay(bill.id, index, member.address, member.share)}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Settled check */}
            {bill.members.every((m: any) => m.paid) && (
              <div className="mt-4 text-center bg-green-100 rounded-xl py-3">
                <p className="text-green-700 font-bold">🎉 Bill Fully Settled on Blockchain!</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <SendAlgo
        openModal={sendAlgoModal}
        closeModal={() => setSendAlgoModal(false)}
        defaultTo={payingMember?.address || ''}
        defaultAmount={payingMember?.share || ''}
      />
    </div>
  )
}

export default Home