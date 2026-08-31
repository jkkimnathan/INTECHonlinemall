'use client'

/**
 * 계정 활성화 링크 표시 다이얼로그
 * 거래처 등록, 승인, 담당자 추가, 비밀번호 재설정 후 공통으로 사용.
 * 비밀번호 원문 대신 만료·1회성 링크를 전달한다 (보안 감사 P0 반영).
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CredentialDialogProps {
  open: boolean
  loginId: string
  activationLink: string | null
  onClose: () => void
}

export default function CredentialDialog({ open, loginId, activationLink, onClose }: CredentialDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`로그인 ID: ${loginId}\n비밀번호 설정 링크: ${activationLink ?? ''}`)
      setCopied(true)
      toast.success('복사 완료')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('복사에 실패했습니다. 수동으로 복사해주세요.')
    }
  }

  const handleClose = () => {
    if (!copied && activationLink) {
      if (!confirm('활성화 링크를 전달하셨나요? 이 화면을 닫으면 다시 확인할 수 없습니다. (만료 시 담당자 재설정으로 재발급 가능)')) {
        return
      }
    }
    onClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-green-600" />
            계정이 생성되었습니다
          </AlertDialogTitle>
          <AlertDialogDescription>
            승인 이메일이 발송되었습니다. 필요 시 아래 링크를 직접 전달할 수도 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">로그인 ID</span>
              <span className="font-mono font-medium text-zinc-900">{loginId}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-500">비밀번호 설정 링크 (1회용·만료됨)</span>
              {activationLink ? (
                <span className="font-mono text-xs text-zinc-900 break-all">{activationLink}</span>
              ) : (
                <span className="text-xs text-red-600">
                  링크 생성에 실패했습니다. 담당자 목록의 &quot;비밀번호 재설정&quot;으로 다시 발급해주세요.
                </span>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
            링크를 통해 거래처가 직접 비밀번호를 설정합니다. 비밀번호 원문은 어디에도
            전송되지 않으며, 링크는 1회 사용 후(또는 만료 시) 무효화됩니다.
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="size-4" />
            {copied ? '복사됨' : '복사'}
          </Button>
          <Button onClick={handleClose}>확인</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
