import ChatPanel from '../components/ChatPanel'
import { useAppContext } from '../context/useAppContext'

function ChatPage() {
  const { connectionStatus, messages, profile, sendMessage } = useAppContext()

  return (
    <ChatPanel
      connectionStatus={connectionStatus}
      displayName={profile.displayName}
      messages={messages}
      onSubmit={sendMessage}
    />
  )
}

export default ChatPage
