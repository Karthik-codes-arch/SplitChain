import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useEffect, useMemo, useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface SendAlgoProps {
  openModal: boolean
  closeModal: () => void
  defaultTo?: string
  defaultAmount?: string
}

const SendAlgo = ({ openModal, closeModal, defaultTo = '', defaultAmount = '' }: SendAlgoProps) => {
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [to, setTo] = useState(defaultTo)
  const [amount, setAmount] = useState(defaultAmount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTo(defaultTo)
    setAmount(defaultAmount)
  }, [defaultTo, defaultAmount])

  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ algodConfig })
    client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner])

  const onSend = async () => {
    if (!activeAddress) return enqueueSnackbar('Connect a wallet first', { variant: 'error' })
    const microAlgos = BigInt(Math.floor(Number(amount) * 1e6))
    if (!to || microAlgos <= 0n) return enqueueSnackbar('Enter valid address and amount', { variant: 'error' })
    setLoading(true)
    try {
      await algorand.send.payment({ sender: activeAddress, receiver: to, amount: algokit.microAlgos(microAlgos) })
      enqueueSnackbar('✅ Payment sent on Algorand!', { variant: 'success' })
      closeModal()
    } catch (e) {
      enqueueSnackbar((e as Error).message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="send_algo_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-2xl mb-4">💸 Pay Your Share</h3>
        <p className="text-gray-500 text-sm mb-4">This will send real ALGO on Algorand TestNet</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-600">Recipient Address</label>
            <input
              className="input input-bordered w-full mt-1"
              placeholder="Recipient address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Amount (ALGO)</label>
            <input
              className="input input-bordered w-full mt-1"
              placeholder="Amount (ALGO)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-action">
          <button
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={onSend}
            disabled={loading}
          >
            {loading ? 'Sending...' : '🚀 Send ALGO'}
          </button>
          <button className="btn" onClick={closeModal} disabled={loading}>Cancel</button>
        </div>
      </form>
    </dialog>
  )
}

export default SendAlgo