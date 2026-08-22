import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
    id: number
    message: string
    type: ToastType
}

export interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
}

const toasts = ref<ToastItem[]>([])
let toastCounter = 0

// State untuk Custom Confirmation Modal
const isConfirmOpen = ref(false)
const confirmData = ref<{
    title: string
    message: string
    confirmText: string
    cancelText: string
    isDanger: boolean
    resolve: (value: boolean) => void
}>({
    title: 'Konfirmasi',
    message: '',
    confirmText: 'Ya',
    cancelText: 'Batal',
    isDanger: false,
    resolve: () => { }
})

export const useToast = () => {
    const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
        const id = ++toastCounter
        toasts.value.push({ id, message, type })

        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    const success = (message: string, duration?: number) => showToast(message, 'success', duration)
    const error = (message: string, duration?: number) => showToast(message, 'error', duration)
    const info = (message: string, duration?: number) => showToast(message, 'info', duration)
    const warning = (message: string, duration?: number) => showToast(message, 'warning', duration)

    const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            confirmData.value = {
                title: options.title || 'Konfirmasi',
                message: options.message,
                confirmText: options.confirmText || 'Lanjutkan',
                cancelText: options.cancelText || 'Batal',
                isDanger: options.isDanger ?? false,
                resolve: (result: boolean) => {
                    isConfirmOpen.value = false
                    resolve(result)
                }
            }
            isConfirmOpen.value = true
        })
    }

    const handleConfirm = () => {
        confirmData.value.resolve(true)
    }

    const handleCancel = () => {
        confirmData.value.resolve(false)
    }

    return {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        info,
        warning,
        isConfirmOpen,
        confirmData,
        showConfirm,
        handleConfirm,
        handleCancel
    }
}
