import { Fragment, useState } from 'react'
import { Dialog, Transition, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { XMarkIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'eft', label: 'EFT' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
]

export default function NewPaymentModal({ open, onClose, onSubmit, purchaseOrder, loading }) {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: paymentMethods[0],
    reference_number: '',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date,
      payment_method: formData.payment_method.value,
      reference_number: formData.reference_number || null,
      notes: formData.notes || null
    }

    await onSubmit(data)

    // Reset form
    setFormData({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethods[0],
      reference_number: '',
      notes: ''
    })
  }

  const handleClose = () => {
    setFormData({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethods[0],
      reference_number: '',
      notes: ''
    })
    onClose()
  }

  // Calculate remaining amount
  const totalPaid = purchaseOrder?.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0
  const remaining = (purchaseOrder?.total || 0) - totalPaid

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Record Payment
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Record a payment for PO #{purchaseOrder?.purchase_order_number}
                      </p>
                      <div className="mt-2 rounded-md bg-blue-50 dark:bg-blue-500/10 px-3 py-2">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Remaining to pay: <span className="font-semibold">${remaining.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {/* Amount */}
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="amount"
                            step="0.01"
                            min="0.01"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: remaining.toFixed(2) })}
                          className="mt-1 text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                          Use remaining amount
                        </button>
                      </div>

                      {/* Payment Date */}
                      <div>
                        <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="payment_date"
                          required
                          value={formData.payment_date}
                          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                          className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500"
                        />
                      </div>

                      {/* Payment Method */}
                      <div>
                        <Listbox value={formData.payment_method} onChange={(value) => setFormData({ ...formData, payment_method: value })}>
                          <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                          </Listbox.Label>
                          <div className="relative mt-1">
                            <ListboxButton className="relative w-full cursor-default rounded-md bg-white dark:bg-white/5 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6">
                              <span className="block truncate">{formData.payment_method.label}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </ListboxButton>
                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {paymentMethods.map((method) => (
                                <ListboxOption
                                  key={method.value}
                                  value={method}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                      active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                                    }`
                                  }
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                        {method.label}
                                      </span>
                                      {selected ? (
                                        <span
                                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                            active ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                                          }`}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </div>
                        </Listbox>
                      </div>

                      {/* Reference Number */}
                      <div>
                        <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          id="reference_number"
                          value={formData.reference_number}
                          onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                          className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500"
                          placeholder="Transaction ID, check number, etc."
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-indigo-500"
                          placeholder="Any additional notes about this payment..."
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        >
                          {loading ? 'Recording...' : 'Record Payment'}
                        </button>
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={loading}
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
