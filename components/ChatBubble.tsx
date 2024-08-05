type ChatBubbleProps = {
  id: string;
  content: string;
  role: 'Usuario' | 'IA';
};

export default function ChatBubble({ id, content, role }: ChatBubbleProps) {
  const isUser = role === 'Usuario';
  const bubbleStyle = isUser
    ? 'bg-blue-500 text-white self-end'
    : 'bg-gray-200 text-black self-start';

  return (
    <div id={id} className={`flex flex-col gap-1 w-fit mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${isUser ? 'text-blue-500' : 'text-gray-500'}`}>
          {role}
        </span>
      </div>
      <div className={`p-4 rounded-lg ${bubbleStyle}`}>
        <p className="text-sm">
          {content}
        </p>
      </div>
    </div>
  );
}
