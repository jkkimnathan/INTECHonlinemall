/**
 * 거래처 가입 승인 완료 알림
 */
import { Text, Link } from '@react-email/components'
import EmailLayout, { emailStyles } from './EmailLayout'

interface Props {
  dealerName: string
  contactName: string
  loginId: string
  /** 1회성 비밀번호 설정 링크 (비밀번호 원문은 이메일로 전달하지 않음) */
  activationLink: string
  loginUrl: string
}

export default function DealerApprovedEmail({
  dealerName, contactName, loginId, activationLink, loginUrl,
}: Props) {
  return (
    <EmailLayout previewText={`${dealerName}님의 가입이 승인되었습니다`}>
      <Text style={emailStyles.title}>iPC Mall 가입이 승인되었습니다</Text>
      <Text style={emailStyles.paragraph}>
        안녕하세요, {contactName}님.
      </Text>
      <Text style={emailStyles.paragraph}>
        {dealerName}의 iPC Mall 가입신청이 승인되었습니다.
        아래 버튼을 눌러 비밀번호를 설정하면 바로 이용하실 수 있습니다.
      </Text>

      <table style={emailStyles.table}>
        <tbody>
          <tr>
            <td style={emailStyles.th}>로그인 ID</td>
            <td style={emailStyles.td}>{loginId}</td>
          </tr>
        </tbody>
      </table>

      <Link href={activationLink} style={emailStyles.button}>
        비밀번호 설정하고 시작하기
      </Link>

      <div style={emailStyles.warning}>
        위 링크는 보안을 위해 일정 시간이 지나면 만료되며 1회만 사용할 수 있습니다.
        만료된 경우 로그인 화면의 &quot;비밀번호 찾기&quot;에서 다시 받을 수 있습니다.
      </div>

      <Text style={emailStyles.paragraph}>
        비밀번호 설정 후에는 <Link href={loginUrl}>{loginUrl}</Link> 에서 로그인하세요.
      </Text>
    </EmailLayout>
  )
}
